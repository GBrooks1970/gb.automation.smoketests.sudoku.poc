@util
Feature: Basic Sudoku Solver Logic
  As an automated Sudoku solver
  I want to apply three fundamental solving techniques systematically
  So that I can solve Sudoku puzzles using Unit Completion, Hidden Singles, and Naked Singles

  Background:
    Given a standard 9x9 Sudoku grid is initialized

  # =============================================================================
  # Unit Completion Algorithm Tests
  # =============================================================================

  Scenario Outline: Complete a row with only one missing value
    Given a row contains the values "<rowValues>"
    When the "Unit Completion" algorithm scans the row
    Then the system should identify the missing value as <missing>
    And the value <missing> should be placed in the empty cell

    Examples:
      | rowValues                   | missing |
      | 1, 2, 0, 4, 5, 6, 7, 8, 9 | 3       |

  # =============================================================================
  # Hidden Singles Algorithm Tests
  # =============================================================================

  Scenario: Identify a Hidden Single in a row
    Given row 3 is missing the number 6
    And 8 cells in row 3 cannot contain 6 due to column or block constraints
    When the "Hidden Singles" algorithm is executed for value 6
    Then the system should place 6 in the only valid cell in row 3
    And the grid should reflect the new value

  # =============================================================================
  # Sudoku Constraint Validation Tests
  # =============================================================================

  Scenario Outline: Validate moves against Sudoku constraints
    Given a cell at <row>, <col> is empty
    And the grid state is <gridState>
    When attempting to place <value> at that position
    Then the move should be validated against row, column, and block constraints
    And the validation result should be <result>

    Examples:
      | row | col | value | gridState          | result  |
      | 0   | 0   | 5     | emptyGrid          | VALID   |
      | 0   | 1   | 5     | has5InSameRow      | INVALID |
      | 2   | 0   | 3     | has3InSameCol      | INVALID |
      | 1   | 1   | 7     | has7InSameBlock    | INVALID |
      | 4   | 4   | 9     | noConflicts        | VALID   |
      | 8   | 8   | 1     | has1InRowAndCol    | INVALID |
      | 3   | 6   | 8     | fullyConstrained   | INVALID |
      | 5   | 3   | 4     | noConstraints      | VALID   |

  # =============================================================================
  # PuzzleLoader Tests
  # =============================================================================

  Scenario Outline: Reject JSON boolean puzzle cell values on load
    Given a puzzle with a JSON boolean cell value of "<value>"
    When the PuzzleLoader attempts to load the file
    Then a validation error should be thrown

    Examples:
      | value |
      | true  |
      | false |

  # =============================================================================
  # Audit Trail Tests
  # =============================================================================

  Scenario: Audit trail attributes changes to the correct algorithm
    Given the puzzle "Easy Scan Grid" is loaded from JSON
    And audit logging is enabled
    When the solver attempts to solve it with audit
    Then the audit trail statistics should account for all changes
