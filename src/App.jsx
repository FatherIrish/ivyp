import { useState } from 'react'
import './App.css'

const columns = [ //labels the columns 
  {label: 'Title', key: 'Title'},
  {label: 'Shooter', key: 'Shooter'},
  {label: 'Drill', key: 'Drill'},
  {label: 'Time 1', key: 'Time1'},
  {label: 'Time 2', key: 'Time2'},
  {label: 'Time 3', key: 'Time3'}, //allows the column name to have a space, couldn't figure out how to have the array read time 1. Maybe a simplier way to write this.
]

const drillOptions = [ //used to identify the drop down data map for the drill selection. Eventually i'll be able to have this populate the times in 1, 2, and 3 to identify green and red for above or below par time.
  'test 1',
  'test 2',
  'test 3',
  'test 4',
  'test 5'
]

function App() { //defines the actual sheet functions. identifing six rows and labeling them.
  const [data, setData] = useState(
    Array.from({ length: 6 }, () => ({ // six rows 
      Title: '', //row labels
      Shooter: '',
      Drill: '',
      Time1: '',
      Time2: '',
      Time3: '',
    }))
  )

  function updateCell(rowIndex, field, value) { // I believe this allows me to write into the empty cells.
    const newData = [...data]
    newData[rowIndex][field] = value
    setData(newData)
  }

  function updateCell(rowIndex, field, value) { //adds a new row if the last row is edited.
    setData((prevData) => {
      const newData = prevData.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      );

      const lastRow = newData[newData.length - 1]; //number of new rows
      const hasData = Object.values(lastRow).some((v) => v !== '');
      if (hasData) {
        newData.push({ Title: '', Shooter: '', Drill: '', Time1: '', Time2: '', Time3: '' }); //maintains column count/data
      }

      return newData;
    });
  }

  return (  //pulls data from the App.css file to design the apps screen using the function above - i think.
    <div className='page'>
     <div className="sheet">
      {columns.map((col) => (
        <div key={col.key} className="cell header">
          {col.label}
        </div>
      ))}

      {data.map((row, rowIndex) => //places the columns and labels them into a viewable format
        columns.map((col) => { 
          if (col.key === "Drill") { //the three equal signs are called an assignment, and are not the same as a single equal sign.
            return (
              <select
                key={`${rowIndex}-${col.key}`} //the tilde ` is 
                className="cell"
                value={row[col.key]}
                onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
              >
                <option value ="">--Select Drill </option>
              {drillOptions.map((drill) => (
                <option key={drill} value={drill}>
                  {drill}
                </option>
              ))}
            </select>
          )    
        }
          return (
            <input
              key={`${rowIndex}-${col.key}`} //all other cells are blank and editiable. 
              className="cell"
              value={row[col.key]}
              onChange={(e) =>
                updateCell(rowIndex, col.key, e.target.value)
              }
            />
          )
        })
      )}
    </div>
  </div>
  )
}

export default App
