from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in excel_meeting_booking/__init__.py
from excel_meeting_booking import __version__ as version

setup(
	name="excel_meeting_booking",
	version=version,
	description="A complete meeting booking solution",
	author="Shaid Azmin",
	author_email="azmin@excelbd.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
