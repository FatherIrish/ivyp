import { useState } from 'react'
import './App.css'

const columns = [
  {label: 'Title', key: 'Title'},
  {label: 'Shooter', key: 'Shooter'},
  {label: 'Drill', key: 'Drill'},
  {label: 'Time 1', key: 'Time1'},
  {label: 'Time 2', key: 'Time2'},
  {label: 'Time 3', key: 'Time3'},
]

function App() {
  const [data, setData] = useState(
    Array.from({ length: 6 }, () => ({
      Title: '',
      Shooter: '',
      Drill: '',
      Time1: '',
      Time2: '',
      Time3: '',
    }))
  )

  function updateCell(rowIndex, field, value) {
    const newData = [...data]
    newData[rowIndex][field] = value
    setData(newData)
  }

  return (
    <div className='page'>
     <div className="sheet">
      {columns.map((col) => (
        <div key={col.key} className="cell header">
          {col.label}
        </div>
      ))}

      {data.map((row, rowIndex) =>
        columns.map((col) => {
          return (
            <input
              key={`${rowIndex}-${col.key}`}
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
