import base64
import re
import uuid
from datetime import date

from django.core.files.base import ContentFile
from rest_framework import serializers

from cats.models import Achievement, AchievementCat, Cat


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith("data:image"):
            header, data = data.split(";base64,", 1)
            extension = header.split("/")[-1]
            decoded_file = base64.b64decode(data)
            data = ContentFile(decoded_file, name=f"{uuid.uuid4()}.{extension}")
        return super().to_internal_value(data)


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ("id", "name")
        extra_kwargs = {
            "name": {"validators": []},
        }


class CatSerializer(serializers.ModelSerializer):
    achievements = AchievementSerializer(many=True, required=False)
    owner = serializers.StringRelatedField(read_only=True)
    age = serializers.SerializerMethodField()
    image = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = Cat
        fields = (
            "id",
            "name",
            "color",
            "birth_year",
            "achievements",
            "owner",
            "age",
            "image",
        )
        read_only_fields = ("owner", "age")

    def get_age(self, obj):
        return date.today().year - obj.birth_year

    def validate_birth_year(self, value):
        current_year = date.today().year
        if value > current_year or current_year - value > 40:
            raise serializers.ValidationError("Проверьте год рождения!")
        return value

    def validate_color(self, value):
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
            raise serializers.ValidationError("Цвет должен быть в формате hex #RRGGBB.")
        return value.lower()

    def validate(self, attrs):
        name = attrs.get("name", getattr(self.instance, "name", None))
        color = attrs.get("color", getattr(self.instance, "color", None))
        if name and color and name.lower() == color.lower():
            raise serializers.ValidationError("Имя котика не должно совпадать с цветом.")
        return attrs

    def _set_achievements(self, cat, achievements_data):
        cat.achievementcat_set.all().delete()
        for achievement_data in achievements_data:
            name = achievement_data.get("name", "").strip()
            if not name:
                continue
            achievement, _ = Achievement.objects.get_or_create(name=name)
            AchievementCat.objects.get_or_create(cat=cat, achievement=achievement)

    def create(self, validated_data):
        achievements_data = validated_data.pop("achievements", [])
        cat = Cat.objects.create(**validated_data)
        self._set_achievements(cat, achievements_data)
        return cat

    def update(self, instance, validated_data):
        achievements_data = validated_data.pop("achievements", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if achievements_data is not None:
            self._set_achievements(instance, achievements_data)
        return instance
