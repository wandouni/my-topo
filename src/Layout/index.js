import React, { useEffect, useState, useCallback, useMemo, Fragment, useRef } from 'react';
import { Topology, registerNode } from '@topology/core';
import reactNodes from './Plugin/React-nodes';
import { register as registerChart } from '@topology/chart-diagram';
import {
  activityFinal,
  activityFinalIconRect,
  activityFinalTextRect
} from '@topology/activity-diagram';
import { Tabs, Button, DatePicker, Table, Input } from 'antd';
import { Tools } from '../config/config';
// import { getNodeById } from '../Service/topologyService';
import Header from '../Header';
import NodeComponent from './component/nodeComponent';
import BackgroundComponent from './component/backgroundComponent';
import LineComponent from './component/lineComponent';
import SystemComponent from './LeftAreaComponent/SystemComponent';
import MyComponent from './LeftAreaComponent/MyComponent';
import LineBoxComponent from './LineBoxComponent';
import example from './test.json';
import './index.css';
import { Point } from '@topology/core';
window.Point = Point;
// const { confirm } = Modal;
const { TabPane } = Tabs;
export let canvas;
const Layout = ({ history }) => {
  const [selected, setSelected] = useState({});
  const [isLoadCanvas, setIsLoadCanvas] = useState(false);

  const nodeFormRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const canvasOptions = {
      rotateCursor: '/rotate.cur',
      locked: 2,
      grid: true,
      ruleColor: '#2db7f5',
    };
    
    canvasOptions.on = onMessage;
    canvasRegister();
    canvas = new Topology('topology-canvas', canvasOptions);
    if (window.registerTools) {
      window.registerTools();
      Tools[0].children = Tools[0].children.concat(
        window.topologyTools.map((el) => {
          return {
            data: el.data,
            name: el.data.name,
            icon: 'icon-anniu'
          };
        })
      );
    }
    // async function getNodeData() {
    //   const data = await getNodeById(history.location.state.id);
    //   canvas.open(data.data);
    // }

    // if (history.location.state && history.location.state.from === '/preview') {
    //   confirm({
    //     title: '??????????????????????????????????',
    //     okText: '??????',
    //     cancelText: '??????',
    //     onOk() {
    //       history.location.state.data.locked = 0;
    //       canvas.open(history.location.state.data);
    //     },
    //     onCancel() {
    //       getNodeData();
    //     }
    //   });
    // } else {
    //   if (history.location?.state?.id) {
    //     getNodeData();
    //   }
    // }
    canvas.open(example);
    setIsLoadCanvas(true);
  }, [history]);

  /**
   * ???????????????
   */

  const canvasRegister = () => {
    // activity
    registerNode(
      'activityFinal',
      activityFinal,
      null,
      activityFinalIconRect,
      activityFinalTextRect
    );
    registerChart();
    registerNode('button', reactNodes(Button), null, null, null);
    registerNode('datePicker', reactNodes(DatePicker), null, null, null);
    registerNode('table', reactNodes(Table), null, null, null);
    registerNode('input', reactNodes(Input), null, null, null);
  };

  const onDrag = (event, node) => {
    console.log('ondrag1', node);
    event.dataTransfer.setData('Topology', JSON.stringify(node.data));
  };
  const allowDrop = (ev) => {
    ev.preventDefault();
  };

  /**
   * ????????????????????????, ????????????canvas
   * @params {object} value - ???????????????,??????, x, y??????
   */

  const onHandleFormValueChange = useCallback(
    (value) => {
      if (selected.node.name === 'echarts') {
        canvas.updateProps(selected.node);
        return;
      }

      const {
        rotate,
        data,
        lineWidth,
        strokeStyle,
        dash,
        color,
        fontSize,
        fontFamily,
        fontColor,
        text,
        seriesFunction,
        ...other
      } = value;
      let changedValues = {
        node: {
          rect: other,
          fontColor, 
          fontSize, 
          fontFamily,
          rotate,
          lineWidth,
          strokeStyle,
          dash,
          text,
          data
        }
      };

      if (changedValues.node) {
        // ?????????????????????????????????????????????Node
        for (const key in changedValues.node) {
          if (Array.isArray(changedValues.node[key])) {
          } else if (typeof changedValues.node[key] === 'object') {
            for (const k in changedValues.node[key]) {
              selected.node[key][k] = changedValues.node[key][k];
            }
          } else {
            selected.node[key] = changedValues.node[key];
          }
        }
      }

      canvas.updateProps(selected.node);
    },
    [selected]
  );

  const onEventValueChange = useCallback(
    (value) => {
      selected.node.events = value;
      canvas.updateProps(selected.node);
    },
    [selected]
  );

  const onUpdateComponentProps = useCallback(
    (data) => {
      const { bind, ...value } = data;
      let idx = canvas.data.pens.findIndex((pen) => pen.id === selected.node.id);
      canvas.data.pens[idx].data.props = { ...canvas.data.pens[idx].data.props, ...value };
      canvas.data.pens[idx].data.bind = bind;
      let reader = new FileReader();
      const result = new Blob([JSON.stringify(canvas.data)], { type: 'text/plain;charset=utf-8' });
      reader.readAsText(result, 'text/plain;charset=utf-8');
      reader.onload = (e) => {
        canvas.open(JSON.parse(reader.result));
      };
    },
    [selected]
  );

  const onUpdateHttpProps = useCallback(
    (data) => {
      let idx = canvas.data.pens.findIndex((pen) => pen.id === selected.node.id);
      canvas.data.pens[idx].data.http = {
        api: data.api,
        type: data.type,
        paramsGetStyle: 'subscribe',
        handleResult: data.handleResult,
        paramsArr: data.keys.map((item, index) => ({
          key: data.paramsKey[index],
          value: data.paramsValue[index]
        }))
      };
      let reader = new FileReader();
      const result = new Blob([JSON.stringify(canvas.data)], { type: 'text/plain;charset=utf-8' });
      reader.readAsText(result, 'text/plain;charset=utf-8');
      reader.onload = (e) => {
        canvas.open(JSON.parse(reader.result));
      };
    },
    [selected]
  );

  /**
   * ??????????????????????????????, ????????????canvas
   * @params {object} value - ???????????????,??????, x, y??????
   */

  const onHandleLineFormValueChange = useCallback(
    (value) => {
      const { dash, lineWidth, strokeStyle, name, fromArrow, toArrow, ...other } = value;
      const changedValues = {
        line: { rect: other, lineWidth, dash, strokeStyle, name, fromArrow, toArrow }
      };
      if (changedValues.line) {
        // ?????????????????????????????????????????????line
        for (const key in changedValues.line) {
          if (Array.isArray(changedValues.line[key])) {
          } else if (typeof changedValues.line[key] === 'object') {
            for (const k in changedValues.line[key]) {
              selected.line[key][k] = changedValues.line[key][k];
            }
          } else {
            selected.line[key] = changedValues.line[key];
          }
        }
      }
      canvas.updateProps(selected.line);
    },
    [selected]
  );

  /**
   * ??????????????????????????????
   * @params {string} event - ????????????
   * @params {object} data - ????????????
   */

  const onMessage = (event, data) => {
    switch (event) {
      case 'node': // ??????
      case 'addNode':
        // ??????node?????????, ????????????????????????????????????
        if (nodeFormRef.current) {
          nodeFormRef.current.resetFields();
        }
        setSelected({
          node: data,
          line: null,
          multi: false,
          nodes: null,
          locked: data.locked
        });
        break;
      case 'line': // ??????
      case 'addLine':
        setSelected({
          node: null,
          line: data,
          multi: false,
          nodes: null,
          locked: data.locked
        });
        break;
      case 'space': // ?????????
        setSelected({
          node: null,
          line: null,
          multi: false,
          nodes: null,
          locked: null
        });
        break;
      default:
        break;
    }
  };

  /**
   * ????????????????????????
   */

  const rightAreaConfig = useMemo(() => {
    return {
      node: selected && (
        <NodeComponent
          data={selected}
          onFormValueChange={onHandleFormValueChange}
          onEventValueChange={onEventValueChange}
          onUpdateComponentProps={(value) => onUpdateComponentProps(value)}
          onUpdateHttpProps={(value) => onUpdateHttpProps(value)}
          ref={nodeFormRef}
        />
      ), // ??????Node?????????????????????
      line: selected && (
        <LineComponent data={selected} onFormValueChange={onHandleLineFormValueChange} />
      ), // ???????????????????????????
      default: canvas && <BackgroundComponent data={canvas} /> // ???????????????????????????
    };
  }, [
    selected,
    onHandleFormValueChange,
    onHandleLineFormValueChange,
    onEventValueChange,
    onUpdateComponentProps,
    onUpdateHttpProps
  ]);

  /**
   * ?????????????????????????????????
   */

  const renderRightArea = useMemo(() => {
    let _component = rightAreaConfig.default;
    Object.keys(rightAreaConfig).forEach((item) => {
      if (selected[item]) {
        _component = rightAreaConfig[item];
      }
    });
    return _component;
  }, [selected, rightAreaConfig]);

  const renderHeader = useMemo(() => {
    if (isLoadCanvas) return <Header canvas={canvas} history={history} />;
  }, [isLoadCanvas, history]);

  useEffect(() => {
    if (dragRef.current) {
      let disX = 0,
        disY = 0,
        disW = 0,
        disH = 0;
      const oPanel = document.getElementById('topology-canvas');
      dragRef.current.onmousedown = (ev) => {
        ev = ev || window.event;
        disX = ev.clientX; // ???????????????????????????x??????
        disY = ev.clientY; // ???????????????????????????Y??????
        disW = oPanel.offsetWidth; // ???????????????div??????
        disH = oPanel.offsetHeight;
        document.onmousemove = function (ev) {
          //??????????????????????????? ???????????????????????????????????????
          var W = ev.clientX - disX + disW;
          var H = ev.clientY - disY + disH;
          oPanel.style.width = W + 'px'; // ?????????????????????
          oPanel.style.height = H + 'px'; // ?????????????????????
          canvas.resize({ width: W, height: H });
        };
        document.onmouseup = function () {
          document.onmousemove = null;
          document.onmouseup = null;
        };
      };
    }
  }, []);

  return (
    <Fragment>
      {renderHeader}
      <div className="page">
        <div className="tool">
          <Tabs defaultActiveKey="1">
            <TabPane tab="????????????" key="1" style={{ margin: 0 }}>
              <SystemComponent onDrag={onDrag} allowDrop={allowDrop} Tools={Tools} />
            </TabPane>
            <TabPane tab="????????????" key="2" style={{ margin: 0 }}>
              <MyComponent />
            </TabPane>
          </Tabs>
        </div>
        <div className="full">
          <div style={{ minWidth: 2000 }}>
            <LineBoxComponent direction="up" id="calibrationUp" />
            <div style={{ width: 50, height: '100%', position: 'absolute', left: 0, top: 50 }}>
              <LineBoxComponent direction="right" id="calibrationLeft" />
            </div>
            <div
              id="topology-canvas"
              style={{
                width: 1200,
                height: 800,
                boxShadow: '2px 0 10px rgb(0 0 0 / 20%)',
                position: 'relative',
                margin: '50px 50px'
              }}
            >
              <div
                ref={dragRef}
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: 10,
                  height: 10,
                  zIndex: 999,
                  background: 'gray',
                  cursor: 'cell'
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="props">{renderRightArea}</div>
      </div>
    </Fragment>
  );
};

export default Layout;
