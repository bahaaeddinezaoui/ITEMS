from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class that allows clients to override the page size
    via the 'page_size' query parameter, with a maximum limit of 2000.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 2000
