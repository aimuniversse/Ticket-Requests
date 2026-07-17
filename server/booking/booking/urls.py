"""
URL configuration for booking project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from operators.views import ApproveOperatorAPIView, OperatorListAPIView, RejectOperatorAPIView, ActivateOperatorAPIView, DeactivateOperatorAPIView, WalletAPIView, WalletHistoryAPIView
from customer.views import LeadListAPIView, MyLeadsAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/customer/', include('customer.urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/auth/', include('operators.urls')),
    path('api/operators/', OperatorListAPIView.as_view(), name='operator-list'),
    path('api/operators/<int:operator_id>/approve/', ApproveOperatorAPIView.as_view(), name='approve-operator-alt'),
    path('api/operators/<int:operator_id>/reject/', RejectOperatorAPIView.as_view(), name='reject-operator-alt'),
    path('api/operators/<int:operator_id>/activate/', ActivateOperatorAPIView.as_view(), name='activate-operator-alt'),
    path('api/operators/<int:operator_id>/deactivate/', DeactivateOperatorAPIView.as_view(), name='deactivate-operator-alt'),
    path('api/leads/', LeadListAPIView.as_view(), name='lead-list-alt'),
    path('api/leads/my-leads/', MyLeadsAPIView.as_view(), name='my-leads-alt'),
    path('api/wallet/', WalletAPIView.as_view(), name='wallet-alt'),
    path('api/wallet/history/', WalletHistoryAPIView.as_view(), name='wallet-history-alt'),
]
