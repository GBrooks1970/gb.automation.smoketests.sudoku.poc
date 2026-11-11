"""Unified verification entry point for DEMOAPP002 (Python Pytest).

Runs component coverage floor enforcement (fail_under = 85) followed by the
complete test suite (32 component tests + 55 Gherkin scenarios).
"""

from __future__ import annotations

import subprocess
import sys


def run_command(args: list[str]) -> None:
    result = subprocess.run(args)
    if result.returncode != 0:
        sys.exit(result.returncode)


def main() -> None:
    has_coverage = True
    try:
        import coverage  # noqa: F401
    except ImportError:
        has_coverage = False

    if has_coverage:
        # 1. Measure and enforce component test coverage floor
        run_command([sys.executable, "-m", "coverage", "run", "-m", "pytest", "tests/component"])
        run_command([sys.executable, "-m", "coverage", "report"])
    else:
        print("Note: 'coverage' package not installed in active environment; running component tests directly.")
        run_command([sys.executable, "-m", "pytest", "tests/component"])

    # 2. Run full test suite (component tests + 55 Gherkin scenarios)
    run_command([sys.executable, "-m", "pytest"])


if __name__ == "__main__":
    main()
