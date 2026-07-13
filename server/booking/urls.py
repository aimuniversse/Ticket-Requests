from django.contrib import admin
from django.urls import include, path

urlpatterns = [
<<<<<<< HEAD:booking/urls.py
    path("admin/", admin.site.urls),
    path("api/customer/", include("customer.urls")),
    path("api/admin/", include("authentication.urls")),
=======
    path('admin/', admin.site.urls),
    path("api/customer/",include("customer.urls")),
    path('api/auth/',include("accounts.urls")),
    path('api/auth/',include("operators.urls"))
>>>>>>> 9ce6eb57a7bac59762c875a2365aa3e7397d11a4:server/booking/urls.py
]
