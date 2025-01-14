import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { SheetComponent } from '@antv/s2-react';
import '@antv/s2-react/dist/style.min.css';
import 'antd/es/checkbox/style/index.css';


// 初始化配置
const s2Options = {
  width: 600,
  height: 400,
  showSeriesNumber: true,
  tooltip: { showTooltip: false },
  interaction: { enableCopy: true, hoverHighlight: false },
  showDefaultHeaderActionIcon: false,
};

// 初始化数据
const s2DataCfg = {
  fields: { columns: ['province', 'city', 'type', 'price'] },
  sortParams: [],
};

const App = ({ data }) => {
  const S2Ref = useRef(null);
  const [options, setOptions] = useState(s2Options);
  const [dataCfg, setDataCfg] = useState({ ...s2DataCfg, data });


  return (
    <div style={{ position: 'relative' }}>
      <SheetComponent
        ref={S2Ref}
        dataCfg={dataCfg}
        options={options}
        sheetType="editable"
      />
    </div>
  );
};

fetch('../data/basic-table-mode.json')
  .then((res) => res.json())
  .then((res) => {
    ReactDOM.render(<App data={res} />, document.getElementById('container'));
  });
