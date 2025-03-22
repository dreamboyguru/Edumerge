import React from 'react';
import { format } from 'sql-formatter';

const DBQueries = () => {
    const data = [
        {
            id: 1,
            name: "Check performance of employee",
            value: 1,
            keys: `SELECT tm.TMId, tm.AssignedTo, sf.Fname, tt.TaskName, tm.TicketNo, tm.DueDate, tm.CompletionDate, tm.SchoolId, ts.SchoolName, tm.TimeSpent, tm.Status, tm.TaskDesc FROM TaskManagement tm INNER JOIN masterstaff sf ON sf.EMUniqueId = tm.AssignedTo AND sf.EMUniqueId = '1477751' INNER JOIN institutiondepartment dt ON dt.DepartmentId = sf.DepartmentId INNER JOIN TaskTypes tt ON tt.TaskTypeId = tm.TaskTypeId INNER JOIN ed_security.tblschool ts ON ts.SchoolID = tm.SchoolId WHERE tm.CompletionDate BETWEEN '2025-03-17' AND '2025-03-21' ORDER BY sf.DepartmentId, sf.Fname `,
            text: "SQL query to check performance of an employee",
        }
    ];

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert('Copied to clipboard'))
            .catch(err => console.error('Failed to copy:', err));
    };

    return (
        <div className="p-4 border rounded bg-light">
            <h3 className="text-dark mb-3">Fee Receipt Label Setup</h3>
            <div className="row">
                {data.map((item) => (
                    <div className="col-md-6 mb-4" key={item.id}>
                        <div className="p-3 border rounded bg-white">
                            <b>{item.name}</b>
                            <div className="position-relative" style={{ height: '500px' }}>
                                <textarea
                                    className="form-control"
                                    rows="12"
                                    readOnly
                                    value={format(item.keys)}
                                    style={{
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        backgroundColor: '#f8f9fa',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        fontSize: '14px',
                                        height: '100%',
                                    }}
                                />
                                <button
                                    className="btn btn-primary position-absolute"
                                    style={{ top: '5px', right: '5px', padding: '4px'}}
                                    onClick={() => copyToClipboard(item.keys)}
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="mt-2">
                                <b>Details:</b> {item.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DBQueries;
