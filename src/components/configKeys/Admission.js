import React from 'react'

const Admission = () => {
    const data = [
        {
            id: 1,
            name: "Override Admission output form link",
            value: 1,
            keys: {
                "custom_pdflink": "/onlineadmissionform/5486_admission_form.html",
                "overRidePhotopathWithCustomPath": 1
            },
            text: "Override Admission output form Link"
        },
        {
            id: 1,
            name: "NewReceiptCreationRoutine, Custom_FeeReceiptNo",
            value: 1,
            keys: {
                "custom_pdflink": "/onlineadmissionform/5486_admission_form.html",
                "overRidePhotopathWithCustomPath": 1
            },
            text: "Override Admission output form"
        },
    ];
    return (
        <div className="p-4 border rounded bg-light">
            <h3 className="text-dark mb-3">Fee Receipt Label Setup</h3>
            <div className="row">
                {data.map((item) => (
                    <div className="col-md-6 mb-4" key={item.id}>
                        <div className="p-3 border rounded bg-white">
                            <b>{item.name}</b>
                            <div className="position-relative">
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    readOnly
                                    value={JSON.stringify(item.keys, null, 2)}
                                />
                                <button
                                    className="btn btn-primary position-absolute"
                                    style={{ top: '1px', right: '1px' }}
                                    // onClick={() => {
                                    //     navigator.clipboard.writeText(JSON.stringify(item.keys, null, 2));
                                    //     alert('Copied to clipboard');
                                    // }}
                                >
                                    Copy
                                </button>
                            </div>
                            <div className="mt-2">
                                <b>Details : </b>
                                {item.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Admission