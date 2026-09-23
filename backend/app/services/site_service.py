from typing import Dict, Any
from ..data.mock_data import db

def get_site_spatial_data() -> Dict[str, Any]:
    return {
        "machines": db.site_machines,
        "workers": db.site_workers,
        "conflicts": db.site_conflicts
    }
