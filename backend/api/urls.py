from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AchievementViewSet, CatViewSet

router = DefaultRouter()
router.register("cats", CatViewSet, basename="cats")
router.register("achievements", AchievementViewSet, basename="achievements")

urlpatterns = [
    path("", include(router.urls)),
    path("", include("djoser.urls")),
    path("", include("djoser.urls.authtoken")),
]
