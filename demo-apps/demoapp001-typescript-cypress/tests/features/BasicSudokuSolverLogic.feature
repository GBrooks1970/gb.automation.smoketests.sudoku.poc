@util @stack-demoapp001
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

  Scenario: Complete a column with only one missing value
    Given column 0 contains 8 non-zero values
    And the missing digit is 7
    When the "Unit Completion" algorithm scans the column
    Then the system should place 7 in the empty cell of column 0

  Scenario: Complete a 3x3 block with only one missing value
    Given a 3x3 block at position (0, 0) contains 8 non-zero values
    And the missing digit is 4
    When the "Unit Completion" algorithm scans the block
    Then the system should place 4 in the empty cell of that block

  Scenario: Unit Completion returns false when no units have exactly one empty cell
    Given no row, column, or block has exactly one empty cell
    When the "Unit Completion" algorithm is executed
    Then the algorithm should return false
    And no cells should be modified

  # =============================================================================
  # Hidden Singles Algorithm Tests
  # =============================================================================

  Scenario: Identify a Hidden Single in a row
    Given row 3 is missing the number 6
    And 8 cells in row 3 cannot contain 6 due to column or block constraints
    When the "Hidden Singles" algorithm is executed for value 6
    Then the system should place 6 in the only valid cell in row 3
    And the grid should reflect the new value

  Scenario: Identify a Hidden Single in a column
    Given column 5 is missing the number 2
    And 8 cells in column 5 cannot contain 2 due to row or block constraints
    When the "Hidden Singles" algorithm is executed for value 2
    Then the system should place 2 in the only valid cell in column 5
    And the grid should reflect the new value

  Scenario: Identify a Hidden Single in a 3x3 block
    Given a 3x3 block has four empty cells
    And the number 5 is present in rows that intersect three of those empty cells
    When the "Hidden Singles" algorithm is executed for value 5
    Then the system should place 5 in the one remaining valid cell of that block
    And the grid should reflect the new value

  Scenario: Hidden Singles returns false when digit already exists in unit
    Given row 0 already contains the digit 9
    When the "Hidden Singles" algorithm is executed for value 9
    Then the algorithm should skip row 0
    And no cells in row 0 should be modified

  Scenario: Hidden Singles returns false when no single candidate location exists
    Given the number 7 can be placed in multiple locations within a unit
    When the "Hidden Singles" algorithm is executed for value 7
    Then the algorithm should return false
    And no cells should be modified

  # =============================================================================
  # Naked Singles Algorithm Tests
  # =============================================================================

  Scenario: Identify a Naked Single by elimination
    Given an empty cell at row 4, column 4
    And the numbers 1, 2, 3 are in the same row
    And the numbers 4, 5, 6 are in the same column
    And the numbers 7, 8 are in the same 3x3 block
    When the "Naked Singles" algorithm is executed
    Then the system should determine the only possible value is 9
    And the cell at row 4, column 4 should be updated to 9

  Scenario Outline: Naked Singles with multiple candidates
    Given an empty cell has <count> possible candidates: "<candidates>"
    When the "Naked Singles" algorithm is executed
    Then the cell should not be filled
    And the algorithm should continue to other cells

    Examples:
      | count | candidates |
      | 3     | 2, 5, 8    |

  Scenario: Naked Singles finds multiple cells in one pass
    Given 3 empty cells each have exactly one possible value
    When the "Naked Singles" algorithm is executed
    Then all 3 cells should be filled with their respective values
    And the algorithm should return true

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
  # Orchestration and Main Execution Loop Tests
  # =============================================================================

  Scenario: Execute solving techniques in correct order
    Given a puzzle that requires all three techniques
    When the main solving loop executes one iteration
    Then "Unit Completion" should be attempted first
    And "Hidden Singles" should be attempted second for digits 1 through 9
    And "Naked Singles" should be attempted third
    And the execution order should be maintained in every iteration

  Scenario: Solve a puzzle requiring multiple iterations
    Given a partially filled grid solvable with basic techniques
    When the solver executes the main loop
    Then multiple iterations should occur
    And each iteration should make progress until solved
    And the final status should be "SOLVED"

  Scenario: Stop execution when puzzle is completely solved
    Given every cell in the 9x9 grid contains a non-zero digit
    And no digits violate row, column, or block rules
    When the main execution loop runs
    Then the system should detect the grid is full
    And the status should return "SOLVED"
    And no algorithms should be executed

  Scenario: Detect when puzzle requires advanced techniques
    Given a puzzle that cannot be solved with basic techniques
    When the solver executes all three algorithms without making changes
    Then the system should exit the solving loop
    And the status should return "STUCK_ON_ADVANCED_LOGIC"

  Scenario: Solve an easy puzzle end-to-end
    Given the "Easy Scan Grid" puzzle is loaded
    When the orchestrator solve method is called
    Then the puzzle should be completely solved
    And all 81 cells should contain valid digits
    And the status should be "SOLVED"

  # =============================================================================
  # PuzzleLoader Tests
  # =============================================================================

  Scenario: Load puzzles from JSON file
    Given a puzzles.json file exists with 5 puzzles
    When the PuzzleLoader is initialized with "../puzzles.json"
    Then 5 puzzles should be successfully loaded
    And each puzzle should have a name, difficulty, description, and grid

  Scenario: Validate puzzle grid dimensions on load
    Given a puzzle with an 8x9 grid in the JSON file
    When the PuzzleLoader attempts to load the file
    Then a validation error should be thrown
    And the error message should indicate "must have exactly 9 rows"

  Scenario: Validate puzzle grid values on load
    Given a puzzle with a cell value of 10 in the JSON file
    When the PuzzleLoader attempts to load the file
    Then a validation error should be thrown
    And the error message should indicate "invalid value"

  Scenario: Get puzzle by name
    Given puzzles are loaded from JSON
    When requesting a puzzle by name "Easy Scan Grid"
    Then the correct puzzle should be returned
    And the puzzle grid should be a 9x9 array

  Scenario: Get puzzles by difficulty
    Given puzzles are loaded from JSON
    When requesting puzzles with difficulty "easy"
    Then only puzzles marked as "easy" should be returned
    And the result should be an array of matching puzzles

  Scenario: Get puzzle by index
    Given puzzles are loaded from JSON
    When requesting puzzle at index 0
    Then the first puzzle in the collection should be returned

  Scenario: Handle missing puzzle file gracefully
    Given the puzzles.json file does not exist
    When the PuzzleLoader is initialized
    Then an error should be thrown
    And the error message should contain "Puzzle file not found"

  # =============================================================================
  # Grid Initialization and Deep Copy Tests
  # =============================================================================

  Scenario: Initialize solver with puzzle grid
    Given a puzzle grid with specific values
    When a SudokuSolver is created with that grid
    Then the solver's working grid should contain a deep copy of the puzzle
    And the original grid should remain unchanged

  Scenario: Verify original grid is preserved during solving
    Given a SudokuSolver is created with a puzzle grid
    When the solver modifies cells during solving
    Then the origGrid property should remain unchanged
    And the working grid should reflect all modifications

  # =============================================================================
  # Integration Tests - Full Solving Scenarios
  # =============================================================================

  Scenario: Solve "Easy Scan Grid" puzzle
    Given the puzzle "Easy Scan Grid" is loaded from JSON
    When the solver attempts to solve it
    Then the status should be "SOLVED"
    And all cells should be filled
    And the solution should be valid (no constraint violations)

  Scenario: Solve "Logic Squeeze Grid" puzzle
    Given the puzzle "Logic Squeeze Grid" is loaded from JSON
    When the solver attempts to solve it
    Then the status should be "SOLVED"
    And the puzzle should require all three techniques
    And the solution should be valid

  Scenario: Solve "Minimal Clues" puzzle using complete Hidden Singles
    Given the puzzle "Minimal Clues" is loaded from JSON
    When the solver attempts to solve it
    Then the status should be "SOLVED"
    And all cells should be filled
    And the solution should be valid (no constraint violations)

  Scenario: Solve "Crosshatch Challenge" puzzle using row and column Hidden Singles
    Given the puzzle "Crosshatch Challenge" is loaded from JSON
    When the solver attempts to solve it
    Then the status should be "SOLVED"
    And all cells should be filled
    And the solution should be valid (no constraint violations)

  Scenario: Handle empty grid appropriately
    Given an empty 9x9 grid with all zeros
    When the solver attempts to solve it
    Then the status should be "STUCK_ON_ADVANCED_LOGIC"
    And no cells should be filled
    And no errors should occur

  # =============================================================================
  # Edge Cases and Error Handling
  # =============================================================================

  Scenario: Handle grid with invalid dimensions
    Given a grid with 8 rows instead of 9
    When attempting to create a SudokuSolver
    Then validation should detect the dimension error
    And an appropriate error should be raised

  Scenario: Handle grid with duplicate values in row
    Given a grid where row 0 contains two 5's
    When the solver attempts to solve
    Then the solver should not find valid moves
    And the puzzle should be unsolvable

  Scenario: Verify algorithm returns false when no progress made
    Given a grid state where no algorithm can make progress
    When each algorithm is executed individually
    Then "Unit Completion" should return false
    And "Hidden Singles" should return false for all digits 1-9
    And "Naked Singles" should return false
    And the main loop should exit

  Scenario: Test multiple solvers with different puzzles concurrently
    Given 3 different puzzles are loaded
    When 3 separate SudokuSolver instances are created
    Then each solver should maintain its own independent grid state
    And solving one should not affect the others

  # =============================================================================
  # Audit Trail Tests
  # =============================================================================

  Scenario: Audit trail captures all cell changes for a solved puzzle
    Given the puzzle "Easy Scan Grid" is loaded from JSON
    And audit logging is enabled
    When the solver attempts to solve it with audit
    Then the audit trail should be generated
    And the audit trail should contain at least one cell change
    And every cell change should have an algorithm attribution

  Scenario: Audit trail attributes changes to the correct algorithm
    Given the puzzle "Easy Scan Grid" is loaded from JSON
    And audit logging is enabled
    When the solver attempts to solve it with audit
    Then the audit trail statistics should account for all changes

  Scenario: Solver without audit logging produces no trail
    Given the puzzle "Easy Scan Grid" is loaded from JSON
    When the solver attempts to solve it
    Then no audit trail should be present
