from django.db import models


class Transaction(models.Model):
    isReady = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "transactions"

    def __str__(self):
        return self.id
