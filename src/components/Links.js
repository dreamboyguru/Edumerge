import React from 'react';
import { FaRegCopy } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa6";

const Links = () => {
    const data = [
        { label: "Stage email", text: "ssh ubuntu@stage.edumerge.com" },
        { label: "Stage Program File Path", text: "cd /home/portal/efsData/git/edumerge" },
        { label: "Stage backup file path", text: "cd ../portal/backup" },
        { label: "Full backup from Live", text: "./getLiveProdDB.sh" },
        { label: "partial backup from Live", text: "./PartialBackup.sh" },
        { label: "School Details", text: "https://login.edumerge.com/V2/schoolinfo/Dev_Team_SchoolData.html" },
        { label: "Razorpay Logs1234567", text: "https://app.edumerge.com/V2/feereceipt/RazorpayJson/EM5018_Sep-24.json" },
        { label: "Column 2 - Row 4", text: "This is the second column of the fourth row." }
    ];

    const [copiedIndex, setCopiedIndex] = React.useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    };

    return (
        <div className="pt-4 bg-light">
            <div className="  row">
                {data.map((item, index) => (
                    <div className="col-6 mb-4" key={index}>
                        <div 
                            className="p-3 text-black shadow-sm" 
                            style={{ 
                                backgroundColor: '#f5f3f3', 
                                borderRadius: '8px',
                                position: 'relative'
                            }}
                        >
                            <label className="fw-bold" style={{ fontSize: '1.1rem' }}>
                                {item.label}
                            </label>
                            {copiedIndex === index && 
                                    <span 
                                        className="ms-12 badge bg-success" 
                                        style={{ position: 'absolute', zIndex: 2, marginLeft: '130px' }}
                                    >
                                        Copied!
                                    </span>
                                }
                            <div className='d-flex flex-row rounded mt-2 border'>
                                <input 
                                    type="text" 
                                    className="col-11 p-2" 
                                    value={item.text} 
                                    readOnly
                                    style={{ border: 'none', backgroundColor: '#f5f3f3' }}
                                />
                                <button 
                                    className="col-1 p-2"
                                    style={{ 
                                        position: 'relative', 
                                        zIndex: 1, 
                                        border: 'none',
                                        backgroundColor: '#f5f3f3'
                                    }}
                                    onClick={() => handleCopy(item.text, index)}
                                >
                                    {copiedIndex === index ? <FaCopy className='size-7' style={{ fontSize: '25px'}} /> : <FaRegCopy className='size-7' style={{ fontSize: '25px'}} />}
                                </button>
                                
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Links;
