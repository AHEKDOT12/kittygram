from django.core.management.base import BaseCommand

from cats.models import Achievement


class Command(BaseCommand):
    help = "Create default Kittygram achievements."

    def handle(self, *args, **options):
        names = [
            "Ловит мышей",
            "Спит 20 часов",
            "Царапает диван",
            "Прыгает на шкаф",
            "Просит еду",
        ]
        created = 0
        for name in names:
            _, was_created = Achievement.objects.get_or_create(name=name)
            created += int(was_created)

        self.stdout.write(
            self.style.SUCCESS(f"Seed complete. Created achievements: {created}.")
        )
