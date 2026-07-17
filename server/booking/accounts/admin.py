from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# Register your models here.
from .models import User

@admin.register(User)
class CustomerUserAdmin(UserAdmin):

    model = User

    list_display = (
        "phone_number",
        "email",
        "role",
        "approval_status",
        "is_active",
        "created_at",
    )

    list_filter = (
        "role",
        "approval_status",
        "is_active",
    )

    search_fields = (
        "phone_number",
        "email",
    )

    ordering = (
        "created_at",
    )


    fieldsets = (
        (
            "Login Information",
            {
                "fields": (
                    "phone_number",
                    "email",
                    "password",
                )
            }
        ),

        (
            "Role Information",
            {
                "fields": (
                    "role",
                    "approval_status",
                )
            }
        ),

        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            }
        ),

        (
            "Dates",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            }
        ),
    )


    add_fieldsets = (
        (
            "Create User",
            {
                "classes": (
                    "wide",
                ),
                "fields": (
                    "phone_number",
                    "email",
                    "password1",
                    "password2",
                    "role",
                    "approval_status",
                    "is_active",
                ),
            },
        ),
    )
