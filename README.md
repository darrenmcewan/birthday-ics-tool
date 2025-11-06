# CSV to ICS Converter

Convert your CSV birthday data into calendar events (.ics format) that can be imported into any calendar application.

## 📝 CSV Format

Your CSV file should contain these columns:

| Column | Required | Description |
|--------|----------|-------------|
| `name` | Yes | Person's name |
| `birthdate` | Yes | Date of birth (format: DD/MM/YYYY by default) |
| `note` | No | Optional notes about the person |

### Example CSV:
```csv
name;birthdate;note
John Doe;15/03/1990;Best friend
Jane Smith;22/07/1985;Coworker
Bob Johnson;01/12/1995;
```

## ✨ Features

- **Flexible Settings**: 
  - Multiple delimiter options (comma, semicolon, tab, pipe)
  - Customizable date formats (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
  - Adjustable max age for recurring events
- **Column Mapping**: Map your CSV columns to name, date, and notes
- **Instant Download**: Generated ICS file downloads automatically
- **Privacy First**: Everything runs in your browser - no data is uploaded



## 💡 Tips

- The app creates recurring birthday events up to the specified max age
- The preview shows the first 10 rows of your CSV
