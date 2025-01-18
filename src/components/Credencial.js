import React from 'react'

const Credencial = () => {
  return (
    <div class="p-4 border rounded bg-light">
      <h3 class="text-dark mb-3">Fee Receipt Label Setup</h3>
      <ol class="text-secondary">
        <li class="mb-2">
          <b>Step 1 : </b>config[4] keys
          <div class="p-3 mt-2 border rounded bg-white">
             "NewReceiptCreationRoutine": 1, "Custom_FeeReceiptNo": 1
          </div>
        </li>
        <li class="mb-2">
          <b>Step 2 : </b>Change (FeeReceiptNo) IN <b>FeereceiptDefinition</b> tabel
         <div class="p-3 mt-2 border rounded bg-white">
            FeeReceiptNoDisplay
          </div>
        </li>
        <li class="mb-2">
          <b>Step 3 : </b> 
          <div class="p-3 mt-2 border rounded bg-white">
            <ol type='A'>
              <li>Set Label as you want in <b>FeeReceiptLabels</b> Table</li>
              <li>
                <b>keys : </b>
                <ol>
                  <li>Curr_AY = 2024</li>
                  <li>Curr_AY_2 = 24</li>
                  <li>Next_AY = 2025</li>
                  <li>Next_AY_2 = 25</li>
                  <li>Receipt_Number = Receipt number</li>         
                </ol>
              </li>
              <li>DefinitionId take it from FeereceiptDefinition Table primary key</li>
            </ol>
          </div>
        </li>
        <li class="mb-2">Step 3 : Update <b>ReceiptLabelId</b> coloum from <b>tblfeeheads</b> Table
          <div class="p-3 mt-2 border rounded bg-white">
            ReceiptLabelId take it from FeeReceiptLabels Table primary key
          </div>
        </li>
      </ol>
    </div>
  )
}

export default Credencial