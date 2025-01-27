import pandas as pd

# Define players and their IDs
players = []

# Load Excel file (replace 'uno_data.xlsx' with your file path)
data_file = "sqlStatements/MasterUnoSpreadSheet.xlsx"  # Update this with your dataset file path
sheet_name = "Beach 2022"  # Update this with the actual sheet name

# Read Excel data
excel_data = pd.read_excel(data_file, sheet_name=sheet_name, header=None)

# Extract player names from the first row (ignoring the first column and stopping at the first empty column)
players = []
for name in excel_data.iloc[0, 1:]:
    if pd.isna(name):  # Stop if an empty column is encountered
        break
    players.append(name)

player_ids = {name: idx + 1 for idx, name in enumerate(players)}

# Initialize SQL insert statements
insert_players = ""
for player in players:
    insert_players += f"INSERT INTO players (name) SELECT '{player}' WHERE NOT EXISTS (SELECT 1 FROM players WHERE name = '{player}');\n"

insert_scores = "INSERT INTO scores (player_id, round_number, score, tournament_id) VALUES \n"
score_statements = []

# Define tournament_id (hardcoded or dynamically determined)
tournament_id = 5  # Replace with the actual tournament ID or logic to determine it

# Process rows, correctly handling the first row of data and valid rows
round_number = 1
for index, row in excel_data.iterrows():
    if index == 0:  # Skip the first row with player names
        continue
    if row.dropna().empty:  # Stop processing if an empty row is encountered
        break
    if index % 2 == 1 and index > 1:  # Skip rows with totals (odd indices after the first data row)
        continue

    scores = row.iloc[1:len(players) + 1].tolist()  # Only process columns that correspond to the players

    # Add to scores table
    for idx, score in enumerate(scores):
        score_statements.append(f"({player_ids[players[idx]]}, {round_number}, {score}, {tournament_id})")
    round_number += 1

insert_scores += ",\n".join(score_statements) + "\n;\n"

# Write to an output SQL file
with open("insert_statements.sql", "w") as sql_file:
    sql_file.write(insert_players)
    sql_file.write(insert_scores)

print("SQL statements have been generated and saved to 'insert_statements.sql'.")
