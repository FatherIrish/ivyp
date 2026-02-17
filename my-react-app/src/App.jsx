//AI has done a fair bit of the leg work for me, but my main goal was to learn the functions and structures of JAVAscript.
//as of Feb 17 I have started to actually write and diagnose my additions - lowering my use of AI to trouble shoot/identify options.


//things I want to add, 
//make the time columns only accept integers
//Ability to save data such as shooters, and a way to compare times so best time is highlighted for each shooter
//Allow users to input weapon options, istead of pistol it can read Czech 9mm, or Glock 22
//Add a check box for with or with out holster - if checked will automaticall add .20 seconds to the shooters time - a handicap. Even though my times are damn close to shooters with out a holster.

import { useState } from 'react';
import './App.css';

const TitleOptions = ['Operator', 'Safety', 'Shooter'];
const WeaponOptions = ['Carbine', 'Pistol'];

const DrillOptionsByWeapon = {
  Carbine: ['Cover', 'Single Fire', 'Two Shot Reload', 'Eleanor', 'Mozambique', 'Transition'],
  Pistol: ['Cover', 'Single Fire', 'Two Shot Reload', 'Eleanor', 'Mozambique', 'Transition'],
};

const holster_handicap = 0.25;

const createEmptyRow = () => ({
  Title: '',
  Shooter: '',
  Weapon: '',
  Holster: false,
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        while (parsed.length < 5) parsed.push(createEmptyRow());
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
    return Array.from({ length: 5 }, createEmptyRow);
  });

  // Dynamically generate columns
  const columns = (() => {
    const showHolster = data.some(row => row.Weapon === 'Pistol');
    const cols = [
      { label: 'Title', key: 'Title' },
      { label: 'Shooter', key: 'Shooter' },
      { label: 'Weapon', key: 'Weapon' },
    ];
    if (showHolster) cols.push({ label: 'Holster', key: 'Holster' });
    cols.push(
      { label: 'Drill', key: 'Drill' },
      { label: 'Time 1', key: 'Time1' },
      { label: 'Time 2', key: 'Time2' },
      { label: 'Time 3', key: 'Time3' },
      { label: 'AVG', key: 'AVG' }
    );
    return cols;
  })();

  const updateCell = (rowIndex, field, value) => {
    setData(prevData =>
      prevData.map((row, i) => {
        if (i !== rowIndex) return row;

        const updatedRow = { ...row, [field]: value };

        if (field === 'Title') {
          updatedRow.Shooter = '';
          updatedRow.Weapon = '';
          updatedRow.Drill = '';
          updatedRow.Time1 = '';
          updatedRow.Time2 = '';
          updatedRow.Time3 = '';
          updatedRow.Holster = false;
        }

        if (field === 'Weapon') {
          updatedRow.Drill = '';
          updatedRow.Time1 = '';
          updatedRow.Time2 = '';
          updatedRow.Time3 = '';
          updatedRow.Holster = false;
        }

        if (field === 'Drill') {
          updatedRow.Time1 = '';
          updatedRow.Time2 = '';
          updatedRow.Time3 = '';
        }

        return updatedRow;
      })
    );
  };

  const getStandardTime = row => {
    const titleData = TimeStandards[row.Title];
    if (!titleData) return null;
    const base = titleData[row.Drill];
    if (base == null) return null;
    return row.Holster ? base + holster_handicap : base;
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
        <button onClick={saveData} className="save-button">
          Save Table
        </button>

        {/* Header */}
        <div
          className="row header"
          style={{
            gridTemplateColumns: columns
              .map(col => (col.key === 'Holster' || col.key === 'AVG' ? '60px' : '1fr'))
              .join(' '),
          }}
        >
          {columns.map(col => (
            <div key={col.key} className="cell header">
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="row"
            style={{
              gridTemplateColumns: columns
                .map(col => (col.key === 'Holster' || col.key === 'AVG' ? '60px' : '1fr'))
                .join(' '),
            }}
          >
            {columns.map(col => {
              // AVG
              if (col.key === 'AVG') {
                return (
                  <div key={`${rowIndex}-${col.key}`} className="cell avg" style={{ fontWeight: 'bold' }}>
                    {calculateAverage(row)}
                  </div>
                );
              }

              // Title
              if (col.key === 'Title') {
                return (
                  <select
                    key={`${rowIndex}-${col.key}`}
                    className="cell"
                    value={row[col.key]}
                    onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                  >
                    <option value="">-- Select Title --</option>
                    {TitleOptions.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                );
              }

              // Weapon
              if (col.key === 'Weapon') {
                return (
                  <select
                    key={`${rowIndex}-${col.key}`}
                    className="cell"
                    value={row[col.key]}
                    onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                  >
                    <option value="">-- Select Weapon --</option>
                    {WeaponOptions.map(w => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                );
              }

              // Holster
              if (col.key === 'Holster') {
                return (
                  <div key={`${rowIndex}-${col.key}`} className="cell">
                    {row.Weapon === 'Pistol' && (
                      <input
                        type="checkbox"
                        checked={row.Holster}
                        onChange={e => updateCell(rowIndex, 'Holster', e.target.checked)}
                      />
                    )}
                  </div>
                );
              }

              // Drill
              if (col.key === 'Drill') {
                const drillsToShow = row.Weapon ? DrillOptionsByWeapon[row.Weapon] : [];
                return (
                  <select
                    key={`${rowIndex}-${col.key}`}
                    className="cell"
                    value={row[col.key]}
                    onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                  >
                    <option value="">-- Select Drill --</option>
                    {drillsToShow.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
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
                  <div key={`${rowIndex}-${col.key}`} className="cell time-cell">
                    <span className="standard">{standard !== null ? standard.toFixed(2) : ''}</span>
                    <input
                      className="time-input"
                      type="number"
                      step="0.01"
                      value={row[col.key]}
                      onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                    />
                    <span className="difference" style={{ color: differenceColor }}>
                      {difference !== null ? difference : ''}
                    </span>
                  </div>
                );
              }

              // Default input
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
  );
}

export default App;

