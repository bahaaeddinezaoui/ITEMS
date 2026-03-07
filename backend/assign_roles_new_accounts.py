import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ems.settings")
django.setup()

from api.models import Person, Role, PersonRoleMapping, UserAccount


def _get_next_role_id() -> int:
    last_role = Role.objects.order_by("-role_id").first()
    return (last_role.role_id + 1) if last_role else 1


def _get_next_person_id() -> int:
    last_person = Person.objects.order_by("-person_id").first()
    return (last_person.person_id + 1) if last_person else 1


def _get_next_user_id() -> int:
    last_user = UserAccount.objects.order_by("-user_id").first()
    return (last_user.user_id + 1) if last_user else 1


def hash_password(password: str) -> str:
    return hashlib.sha512(password.encode()).hexdigest()


def ensure_role(role_code: str, role_label: str, description: str | None = None) -> Role:
    role = Role.objects.filter(role_code=role_code).first()
    if role:
        return role

    role_id = _get_next_role_id()
    return Role.objects.create(
        role_id=role_id,
        role_code=role_code,
        role_label=role_label,
        description=description,
    )


def assign_role_to_username(username: str, role: Role) -> None:
    user = UserAccount.objects.filter(username=username).select_related("person").first()
    if not user:
        raise RuntimeError(f"UserAccount not found for username: {username}")

    mapping = PersonRoleMapping.objects.filter(person=user.person, role=role).first()
    if mapping:
        return

    PersonRoleMapping.objects.create(person=user.person, role=role)


def ensure_user_account(username: str, password: str, first_name: str, last_name: str) -> UserAccount:
    user = UserAccount.objects.filter(username=username).select_related("person").first()
    now = timezone.now()
    pwd_hash = hash_password(password)

    if user:
        # Keep username, but ensure password is set to the desired value
        if user.password_hash != pwd_hash:
            user.password_hash = pwd_hash
            user.password_last_changed_datetime = now
            user.modified_at_datetime = now
            user.save(update_fields=["password_hash", "password_last_changed_datetime", "modified_at_datetime"])
        return user

    person = Person.objects.create(
        person_id=_get_next_person_id(),
        first_name=first_name,
        last_name=last_name,
        sex="Male",
        birth_date="1990-01-01",
        is_approved=True,
    )

    user = UserAccount.objects.create(
        user_id=_get_next_user_id(),
        person=person,
        username=username,
        password_hash=pwd_hash,
        created_at_datetime=now,
        account_status="active",
        password_last_changed_datetime=now,
        failed_login_attempts=0,
        modified_at_datetime=now,
        # These are nullable in the model, but are often NOT NULL at DB-level in this project
        disabled_at_datetime=now,
        last_login=now,
    )
    return user


def main() -> None:
    password = "123456"
    roles_to_users = [
        {
            "username": "it_bureau_chief",
            "role_code": "it_bureau_chief",
            "role_label": "IT Bureau Chief",
            "description": "IT Bureau Chief",
            "first_name": "IT",
            "last_name": "Bureau Chief",
        },
        {
            "username": "director_admin_sup",
            "role_code": "director_admin_support",
            "role_label": "Director of Administration and Support",
            "description": "Director of Administration and Support",
            "first_name": "Director",
            "last_name": "Admin & Support",
        },
        {
            "username": "prot_sec_chief",
            "role_code": "protection_and_security_bureau_chief",
            "role_label": "Protection and Security Bureau Chief",
            "description": "Protection and Security Bureau Chief",
            "first_name": "Protection & Security",
            "last_name": "Bureau Chief",
        },
        {
            "username": "school_headquarter",
            "role_code": "school_headquarter",
            "role_label": "School headquarter",
            "description": "School headquarter",
            "first_name": "School",
            "last_name": "Headquarter",
        },
    ]

    created_roles = []
    created_users = []
    assigned = []

    for item in roles_to_users:
        user = UserAccount.objects.filter(username=item["username"]).first()
        if not user:
            ensure_user_account(
                username=item["username"],
                password=password,
                first_name=item["first_name"],
                last_name=item["last_name"],
            )
            created_users.append(item["username"])

        role = Role.objects.filter(role_code=item["role_code"]).first()
        if not role:
            role = ensure_role(item["role_code"], item["role_label"], item["description"])
            created_roles.append(role.role_code)

        assign_role_to_username(item["username"], role)
        assigned.append(f"{item['username']} -> {role.role_code}")

    if created_roles:
        print("Created roles:")
        for rc in created_roles:
            print(f"- {rc}")

    if created_users:
        print("Created/updated user accounts (password set to 123456):")
        for u in created_users:
            print(f"- {u}")

    print("Assigned roles:")
    for a in assigned:
        print(f"- {a}")


if __name__ == "__main__":
    main()
