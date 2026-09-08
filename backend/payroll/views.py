import io
from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsHRManager
from employees.models import Employee, EmploymentStatusChoices
from notifications.models import Notification, NotificationType
from .models import Expense, PayrollPeriod, Payslip, SalaryStructure
from .serializers import (
    ExpenseSerializer,
    PayrollPeriodSerializer,
    PayslipSerializer,
    SalaryStructureSerializer,
)


class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all().select_related('employee')
    serializer_class = SalaryStructureSerializer
    permission_classes = [IsHRManager]
    filterset_fields = ['employee']


class PayrollPeriodViewSet(viewsets.ModelViewSet):
    queryset = PayrollPeriod.objects.all().prefetch_related('payslips')
    serializer_class = PayrollPeriodSerializer
    permission_classes = [IsHRManager]
    ordering_fields = ['year', 'month']

    @action(detail=True, methods=['post'], url_path='process-payroll')
    def process_payroll(self, request, pk=None):
        period = self.get_object()
        active_employees = Employee.objects.filter(employment_status=EmploymentStatusChoices.ACTIVE)
        generated_count = 0

        for emp in active_employees:
            structure, _ = SalaryStructure.objects.get_or_create(
                employee=emp,
                defaults={'basic_salary': emp.basic_salary}
            )

            # Check if payslip exists for this employee in this period
            payslip, created = Payslip.objects.get_or_create(
                employee=emp,
                period=period,
                defaults={
                    'payslip_number': f"PAY-{period.year}{period.month:02d}-{emp.employee_id}",
                    'basic_salary': structure.basic_salary,
                    'allowances': structure.total_allowances,
                    'deductions': structure.total_deductions,
                    'gross_salary': structure.gross_salary,
                    'net_salary': structure.net_salary,
                    'payment_date': period.end_date,
                    'is_paid': True
                }
            )
            if created:
                generated_count += 1
                if emp.user:
                    Notification.objects.create(
                        recipient=emp.user,
                        title="Payslip Generated",
                        message=f"Your payslip for period {period.month:02d}/{period.year} has been processed. Net salary: ${payslip.net_salary:,.2f}",
                        notification_type=NotificationType.PAYROLL_PROCESSED,
                        target_url="/payroll"
                    )

        period.is_processed = True
        period.processed_at = timezone.now()
        period.save()

        return Response({
            'status': 'success',
            'generated_count': generated_count,
            'detail': f"Processed payroll for {generated_count} employees."
        })


class PayslipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payslip.objects.all().select_related(
        'employee', 'employee__department', 'employee__designation', 'period'
    )
    serializer_class = PayslipSerializer
    filterset_fields = ['employee', 'period', 'is_paid']
    ordering_fields = ['created_at', 'net_salary']

    @action(detail=False, methods=['get'], url_path='my-payslips')
    def my_payslips(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            slips = Payslip.objects.filter(employee=employee).order_by('-period__year', '-period__month')
            page = self.paginate_queryset(slips)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            return Response(PayslipSerializer(slips, many=True).data)
        except Employee.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['get'], url_path='download-pdf')
    def download_pdf(self, request, pk=None):
        payslip = self.get_object()
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1e1b4b")
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#6b7280")
        )

        elements.append(Paragraph("<b>EMPLOYEEHUB</b>", title_style))
        elements.append(Paragraph("Official Monthly Salary Slip", subtitle_style))
        elements.append(Spacer(1, 15))

        emp = payslip.employee
        header_data = [
            ["Payslip ID:", payslip.payslip_number, "Period:", f"{payslip.period.month:02d} / {payslip.period.year}"],
            ["Employee Name:", emp.full_name, "Employee ID:", emp.employee_id],
            ["Department:", emp.department.name if emp.department else "-", "Designation:", emp.designation.name if emp.designation else "-"],
            ["Payment Date:", str(payslip.payment_date or "-"), "Payment Method:", payslip.payment_method]
        ]
        t_header = Table(header_data, colWidths=[110, 160, 110, 160])
        t_header.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ]))
        elements.append(t_header)
        elements.append(Spacer(1, 20))

        financial_data = [
            ["EARNINGS", "AMOUNT ($)", "DEDUCTIONS", "AMOUNT ($)"],
            ["Basic Salary", f"{payslip.basic_salary:,.2f}", "Tax Deduction", f"{(payslip.deductions * 0.6):,.2f}"],
            ["Allowances", f"{payslip.allowances:,.2f}", "Provident Fund", f"{(payslip.deductions * 0.4):,.2f}"],
            ["Overtime", f"{payslip.overtime_amount:,.2f}", "", ""],
            ["Total Earnings (Gross)", f"{payslip.gross_salary:,.2f}", "Total Deductions", f"{payslip.deductions:,.2f}"],
            ["NET SALARY PAYABLE", f"${payslip.net_salary:,.2f}", "", ""]
        ]
        t_fin = Table(financial_data, colWidths=[170, 100, 170, 100])
        t_fin.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('BACKGROUND', (0, -2), (-1, -2), colors.HexColor('#f1f5f9')),
            ('FONTNAME', (0, -2), (-1, -2), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#dcfce7')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#166534')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(t_fin)
        elements.append(Spacer(1, 30))

        elements.append(Paragraph("<i>This is a computer generated salary document from EmployeeHub and requires no physical signature.</i>", subtitle_style))
        doc.build(elements)

        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Payslip_{payslip.payslip_number}.pdf"'
        return response


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related('employee')
    serializer_class = ExpenseSerializer
    filterset_fields = ['employee', 'is_approved', 'is_reimbursed']
