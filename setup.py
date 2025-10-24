#!/usr/bin/env python3
"""
HIVE-PAW Setup Script

Installation and setup script for the HIVE-PAW API.
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

# Read requirements
requirements = []
with open("requirements.txt", "r") as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="hive-paw",
    version="0.12.0",
    author="HIVE-PAW Team",
    author_email="team@hive-paw.com",
    description="A secure, open-source ledger system for reflection tracking and GIC rewards",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/hive-paw/lab4-proof",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Framework :: FastAPI",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
    ],
    python_requires=">=3.11",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "ruff>=0.1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "hive-paw=main:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)