import React, { Component } from 'react';

import { connect } from 'react-redux';

import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';

import popper from 'cytoscape-popper';

import Tippy from 'tippy.js';
import 'tippy.js/themes/light-border.css';
import ReactDOMServer from 'react-dom/server';

import CytoscapeComponent from 'react-cytoscapejs';
import { iRootState } from '../../../../store';

Cytoscape.use(COSEBilkent);
Cytoscape.use(popper);

const mapState = (state: iRootState) => ({
  issuesGraph: state.initiatives.issuesGraph,
  roadmap: state.initiatives.roadmap,
});

const mapDispatch = (dispatch: any) => ({
  setGraphNode: dispatch.initiatives.setGraphNode,
});

type connectedProps = ReturnType<typeof mapState | any> &
  ReturnType<typeof mapDispatch>;

class NodesGraph extends Component<connectedProps> {
  chartRef: any = React.createRef();
  tippyInstances: any = {};
  selectedTippies: any = {};
  clickedLink = false;

  componentDidMount() {
    const { setGraphNode } = this.props;
    setGraphNode(this.chartRef);
    this.updateChart(this.chartRef);
  }

  componentDidUpdate() {
    this.clickedLink = false;
    this.updateChart(this.chartRef);
  }

  clickIssue = (node: any) => {
    const { roadmap } = this.props;
    if (this.clickedLink === false) {
      this.clickedLink = true;
      const url = roadmap.host + '/browse/' + node.data().key;
      window.open(url, '_blank');
      setTimeout(async () => {
        this.clickedLink = false;
      }, 500);
    }
  };

  makeTippy = (node: any, text: any) => {
    return Tippy(node.popperRef(), {
      content() {
        const div = document.createElement('div');
        div.innerHTML = text;
        return ReactDOMServer.renderToString(<span>{text}</span>);
      },
      trigger: 'manual',
      theme: 'light-border',
      arrow: true,
      placement: 'bottom',
      // hideOnClick: true,
      interactive: true,
      multiple: true,
      sticky: true,
    });
  };

  // Clear all previous tippies
  clearTippies = () => {
    Object.values(this.tippyInstances).forEach((tippy: any) => {
      tippy.hide();
      tippy.destroy();
    });
    this.tippyInstances = {};
    this.selectedTippies = {};
  };

  updateChart = async (cy: any) => {
    const { issuesGraph } = this.props;
    if (issuesGraph.length > 0) {
      this.clearTippies();
      cy.elements().remove();
      cy.add(issuesGraph);

      cy.on('mouseover', 'node', (event: any) => {
        const nodeId = event.target.id();
        const dataNode = event.target.data();
        const node = event.target;
        if (this.tippyInstances[nodeId] === undefined) {
          this.tippyInstances[nodeId] = this.makeTippy(
            node,
            dataNode.summary + ' (' + dataNode.key + ')',
          );
          this.tippyInstances[nodeId].show();
        }
      });

      cy.on('mouseout', 'node', (event: any) => {
        const nodeId = event.target.id();
        if (this.tippyInstances[nodeId] !== undefined) {
          this.tippyInstances[nodeId].hide();
          this.tippyInstances[nodeId].destroy();
          delete this.tippyInstances[nodeId];
        }
      });

      cy.on('click', 'node', (event: any) => {
        this.clickIssue(event.target);
      });

      const layout = cy.layout({
        name: 'cose-bilkent',
        animate: false,
      });
      layout.run();
    }
  };

  render() {
    const stylesheet = [
      {
        selector: 'node',
        style: {
          width: 10,
          height: 10,
          content: 'data(points)',
          fontSize: '0.5em',
          //                    shape: 'vee'
        },
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          width: 2,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd',
        },
      },
      {
        selector: ':parent',
        style: {
          'background-opacity': 0.333,
        },
      },
      {
        selector: '[status = "Done"]',
        style: {
          backgroundColor: '#14892c',
        },
      },
      {
        selector: '[status = "To Do"]',
        style: {
          backgroundColor: '#4a6785',
        },
      },
      {
        selector: '[status = "In Progress"]',
        style: {
          backgroundColor: '#ffd351',
        },
      },
      {
        selector: '[type = "Story"]',
        style: {
          shape: 'ellipse',
        },
      },
      {
        selector: '[type = "Epic"]',
        style: {
          shape: 'rectangle',
        },
      },
      {
        selector: '[type = "Initiative"]',
        style: {
          shape: 'diamond',
        },
      },
      {
        selector: '[distance = 0]',
        style: {
          width: 20,
          height: 20,
        },
      },
      {
        selector: 'edge.not-path',
        style: {
          opacity: 0.1,
          'z-index': 0,
        },
      },
      {
        selector: 'node.not-path',
        style: {
          opacity: 0.333,
          'z-index': 0,
        },
      },
      {
        selector: 'edge.path',
        style: {
          opacity: 0.888,
          'z-index': 0,
          width: 4,
          'line-color': '#2196f3',
          'target-arrow-color': '#2196f3',
        },
      },
    ];
    return (
      <div style={{ textAlign: 'left' }}>
        <CytoscapeComponent
          elements={[]}
          layout={{ name: 'cose-bilkent' }}
          style={{ height: '400px' }}
          stylesheet={stylesheet}
          cy={(cy: any) => (this.chartRef = cy)}
        />
      </div>
    );
  }
}

export default connect(mapState, mapDispatch)(NodesGraph);
