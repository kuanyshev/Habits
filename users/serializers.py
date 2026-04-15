from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    has_password = serializers.SerializerMethodField()

    def get_has_password(self, obj):
        return obj.has_usable_password()

    def validate_nickname(self, value):
        v = (value or "").strip()
        if len(v) < 2:
            raise serializers.ValidationError("Nickname must be at least 2 characters.")
        qs = User.objects.filter(nickname__iexact=v)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This nickname is already taken.")
        return v

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "nickname",
            "email",
            "xp",
            "level",
            "date_joined",
            "onboarding_completed",
            "has_password",
        )
        read_only_fields = ("id", "username", "xp", "level", "date_joined", "has_password")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True, allow_blank=False)
    nickname = serializers.CharField(max_length=64, required=True, trim_whitespace=True)

    class Meta:
        model = User
        fields = ("id", "email", "password", "nickname")

    def validate_nickname(self, value):
        v = (value or "").strip()
        if len(v) < 2:
            raise serializers.ValidationError("Nickname must be at least 2 characters.")
        if User.objects.filter(nickname__iexact=v).exists():
            raise serializers.ValidationError("This nickname is already taken.")
        return v

    def create(self, validated_data):
        from .utils import make_unique_username

        nickname = validated_data.pop("nickname")
        password = validated_data.pop("password")
        user = User(
            username=make_unique_username(nickname),
            email=validated_data.get("email"),
            nickname=nickname,
        )
        user.set_password(password)
        user.save()
        return user
