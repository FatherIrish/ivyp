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

const TimeStandards = {
  Operator: { Cover: 1.5, 'Single Fire': 1.0, 'Two Shot Reload': 3.5, Eleanor: 2.5, Mozambique: 1.5, Transition: 3.0 },
  Shooter: { Cover: 2.0, 'Single Fire': 2.0, 'Two Shot Reload': 5.0, Eleanor: 5.0, Mozambique: 2.5, Transition: 5.0 },
  Safety: { Cover: 1.7, 'Single Fire': 1.8, 'Two Shot Reload': 4.0, Eleanor: 4.5, Mozambique: 2.0, Transition: 4.0 },
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
    return Array.from({ length: 6 }, createEmptyRow);
  });

  const [selectedDrill, setSelectedDrill] = useState('');

  const updateCell = (rowIndex, field, value) => {
    setData(prevData => {
      const updatedData = prevData.map((row, i) => {
        if (i !== rowIndex) return row;
        const updatedRow = { ...row, [field]: value };

        // Reset dependent fields
        if (field === 'Title') {
          updatedRow.Shooter = '';
          updatedRow.Weapon = '';
          updatedRow.Drill = '';
          updatedRow.Time1 = '';
          updatedRow.Time2 = '';
          updatedRow.Time3 = '';
        }
        if (field === 'Weapon') {
          updatedRow.Drill = '';
          updatedRow.Time1 = '';
          updatedRow.Time2 = '';
          updatedRow.Time3 = '';
        }
        if (field === 'Drill') {
          updatedRow.Time1 = '';
          updatedRow.Time2 = '';
          updatedRow.Time3 = '';
        }

        return updatedRow;
      });

      // Auto-add a new row if last row is not empty
      const lastRow = updatedData[updatedData.length - 1];
      if (!isRowEmpty(lastRow)) updatedData.push(createEmptyRow());

      return updatedData;
    });
  };

  const isRowEmpty = row =>
    Object.values(row).every(v => v === '' || v === null || v === undefined);

  const getStandardTime = row => {
    const titleData = TimeStandards[row.Title];
    if (!titleData) return null;
    const base = titleData[selectedDrill];
    return base ?? null;
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
        <button onClick={saveData} className="save-button">Save Table</button>

        {/* Header */}
        <div
          className="row header"
          style={{ gridTemplateColumns: columns.map(col => (col.key === 'AVG' ? '60px' : '1fr')).join(' ') }}
        >
          {columns.map(col => (
            <div key={col.key} className="cell header">{col.label}</div>
          ))}
        </div>

        {/* Data Rows */}
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="row"
            style={{ gridTemplateColumns: columns.map(col => (col.key === 'AVG' ? '60px' : '1fr')).join(' ') }}
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

              // Title dropdown
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

              // Weapon dropdown
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

              // Drill dropdown
              if (col.key === 'Drill') {
                const firstWeapon = row.Weapon;
                const drillsToShow = firstWeapon ? DrillOptionsByWeapon[firstWeapon] : [];
                return (
                  <select
                    key={`${rowIndex}-${col.key}`}
                    className="cell"
                    value={selectedDrill}
                    onChange={e => {
                      setSelectedDrill(e.target.value);
                      // reset times for all rows
                      setData(prev => prev.map(r => ({ ...r, Time1: '', Time2: '', Time3: '' })));
                    }}
                  >
                    <option value="">-- Select Drill --</option>
                    {drillsToShow.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                );
              }

              // Time columns (dial-free)
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
                      type="text"
                      value={row[col.key]}
                      onChange={e => {
                        const newValue = e.target.value;
                        if (/^\d*\.?\d*$/.test(newValue)) updateCell(rowIndex, col.key, newValue);
                      }}
                    />
                    <span className="difference" style={{ color: differenceColor }}>
                      {difference !== null ? difference : ''}
                    </span>
                  </div>
                );
              }

              // Default text input
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