//things I want to add, 
//make the time columns only accept integers
//Ability to save data such as shooters, and a way to compare times so best time is highlighted for each shooter
//Allow users to input weapon options, istead of pistol it can read Czech 9mm, or Glock 22
//Add a check box for with or with out holster - if checked will automaticall add .20 seconds to the shooters time - a handicap. Even though my times are damn close to shooters with out a holster.

import { useState } from 'react';
import './App.css';

const columns = [
  { label: 'Title', key: 'Title' },
  { label: 'Shooter', key: 'Shooter' },
  { label: 'Weapon', key: 'Weapon' },
  { label: 'Drill', key: 'Drill' },
  { label: 'Time 1', key: 'Time1' },
  { label: 'Time 2', key: 'Time2' },
  { label: 'Time 3', key: 'Time3' },
  { label: 'AVG', key: 'AVG' },
];

const TitleOptions = ['Operator', 'Safety', 'Shooter'];
const WeaponOptions = ['Carbine', 'Pistol'];

const DrillOptiosnByWeapon = {
  Carbine: ['Cover', 'Single Fire', 'Two Shot Reload', 'Eleanor', 'Mozambique', 'Transition'],
  Pistol: ['Cover', 'Single Fire', 'Two Shot Reload', 'Eleanor', 'Mozambique', 'Transition'],
};

const createEmptyRow = () => ({
  Title: '',
  Shooter: '',
  Weapon: '',
  Drill: '',
  Time1: '',
  Time2: '',
  Time3: '',
  AVG: '',
});

const TimeStandards = {
  Operator: { Cover: 0.3, 'Single Fire': 0.2, 'Two Shot Reload': 0.4, Eleanor: 0.45, Mozambique: 0.35, Transition: 0.55 },
  Shooter: { Cover: 0.6, 'Single Fire': 0.5, 'Two Shot Reload': 0.7, Eleanor: 0.6, Mozambique: 0.5, Transition: 0.7 },
  Safety: { Cover: 0.4, 'Single Fire': 0.3, 'Two Shot Reload': 0.5, Eleanor: 0.5, Mozambique: 0.4, Transition: 0.6 },
};

function App() {
const [data, setData] = useState(() => {
  const saved = localStorage.getItem('savedData');
  let initialRows = [];

  if (saved) {
    try {
      initialRows = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved data:", e);
    }
  }

  // Ensure at least one empty row at the end
  if (!initialRows.length || Object.values(initialRows[initialRows.length - 1]).some(v => v !== '')) {
    initialRows.push(createEmptyRow());
  }

  return initialRows;
});


  const updateCell = (rowIndex, field, value) => {
    setData(prevData => {
      const newData = prevData.map((row, i) => {
        if (i === rowIndex) {
          const updatedRow = { ...row, [field]: value };
          if (field === 'Weapon') {
            updatedRow.Drill = '';
            updatedRow.Time1 = '';
            updatedRow.Time2 = '';
            updatedRow.Time3 = '';
          }
          return updatedRow;
        }
        return row;
      });

      // Auto-add row if last row has data
      const lastRow = newData[newData.length - 1];
      if (Object.values(lastRow).some(v => v !== '')) newData.push(createEmptyRow());
      return newData;
    });
  };

  const getStandardTime = row => {
    const titleData = TimeStandards[row.Title];
    if (!titleData) return null;
    return titleData[row.Drill] ?? null;
  };

  const calculateAverage = row => {
    const nums = [row.Time1, row.Time2, row.Time3].map(parseFloat).filter(n => !isNaN(n));
    if (!nums.length) return '';
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(3);
  };

  const saveData = () => {
    const nonEmptyRows = data.filter(row => Object.values(row).some(v => v !== ''));
    localStorage.setItem('savedData', JSON.stringify(nonEmptyRows));
    alert('Data Saved!');
  };

  return (
    <div className="page">
      <div className="table-container">
        <button onClick={saveData} style={{ marginBottom: 10, padding: '5px 10px', fontSize: 14 }}>
          Save Table
        </button>

        <div className="sheet">
          {/* Header */}
          {columns.map(col => (
            <div key={col.key} className="cell header">{col.label}</div>
          ))}

          {/* Rows */}
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {columns.map(col => {
                if (col.key === 'AVG') {
                  return (
                    <div key={`${rowIndex}-${col.key}`} className="cell" style={{ fontWeight: 'bold' }}>
                      {calculateAverage(row)}
                    </div>
                  );
                }

                if (col.key === 'Title') {
                  return (
                    <select
                      key={`${rowIndex}-${col.key}`}
                      className="cell"
                      value={row[col.key]}
                      onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                    >
                      <option value="">-- Select Title --</option>
                      {TitleOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  );
                }

                if (col.key === 'Weapon') {
                  return (
                    <select
                      key={`${rowIndex}-${col.key}`}
                      className="cell"
                      value={row[col.key]}
                      onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                    >
                      <option value="">-- Select Weapon --</option>
                      {WeaponOptions.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  );
                }

                if (col.key === 'Drill') {
                  const drillsToShow = row.Weapon ? DrillOptiosnByWeapon[row.Weapon] : [];
                  return (
                    <select
                      key={`${rowIndex}-${col.key}`}
                      className="cell"
                      value={row[col.key]}
                      onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                    >
                      <option value="">-- Select Drill --</option>
                      {drillsToShow.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  );
                }

                // Time columns
                if (col.key.startsWith('Time')) {
                  const standard = getStandardTime(row);
                  const userValue = parseFloat(row[col.key]);
                  const difference =
                    standard !== null && !isNaN(userValue) ? (userValue - standard).toFixed(2) : null;

                  const differenceColor =
                    difference === null
                    ? 'black'
                    : parseFloat(difference) < 0
                    ? 'green'
                    : parseFloat(difference) > 0
                    ? 'red'
                    : 'blue';

                  return (
                    <div key={`${rowIndex}-${col.key}`} className="cell time-cell" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'grey', marginRight: 5 }}>{standard !== null ? standard.toFixed(2) : ''}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={row[col.key]}
                        onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                        style={{ width: 60 }}
                      />
                      <span style={{ color: differenceColor, marginLeft: 5 }}>
                        {difference !== null ? difference : ''}
                      </span>
                    </div>
                  );
                }

                return (
                  <input
                    key={`${rowIndex}-${col.key}`}
                    className="cell"
                    type="text"
                    value={row[col.key]}
                    onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;