from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/customer/", include("customer.urls")),
    path("api/admin/", include("authentication.urls")),
]
