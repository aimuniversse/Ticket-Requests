from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_admin(admin):
    refresh = RefreshToken.for_user(admin)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def blacklist_refresh_token(refresh_token_str):
    from rest_framework_simplejwt.tokens import RefreshToken

    try:
        token = RefreshToken(refresh_token_str)
        token.blacklist()
        return True
    except Exception:
        return False
