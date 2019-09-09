import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
//import cytoscapeQtip from 'cytoscape-qtip';

import popper from 'cytoscape-popper';

import Tippy from 'tippy.js';
import 'tippy.js/themes/light-border.css';
import ReactDOMServer from 'react-dom/server';

import CytoscapeComponent from 'react-cytoscapejs';
import { iRootState } from '../../../store';

Cytoscape.use(COSEBilkent);
Cytoscape.use(popper);

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'relative'
    }
  });

const mapState = (state: iRootState) => ({
  issuesGraph: state.roadmap.issuesGraph
});

const mapDispatch = (dispatch: any) => ({
  setGraphNode: dispatch.roadmap.setGraphNode
});

type connectedProps = ReturnType<typeof mapState | any> &
  ReturnType<typeof mapDispatch>;

class TreeGraph extends Component<connectedProps> {
  chartRef: any = React.createRef();
  tippyInstances: any = {};
  selectedTippies: any = {};
  clickedLink: boolean = false;

  componentDidMount() {
    const { setGraphNode } = this.props;
    setGraphNode(this.chartRef);
    this.updateChart(this.chartRef);
  }

  componentDidUpdate() {
    this.clickedLink = false;
    this.updateChart(this.chartRef);
  }

  makeTippy = (node: any, text: any, nodeElement: any) => {
    return Tippy(node.popperRef(), {
      content: function() {
        var div = document.createElement('div');
        div.innerHTML = text;
        //return div;
        console.log(text);
        return ReactDOMServer.renderToString(<span>{text}</span>);
      },
      trigger: 'manual',
      theme: 'light-border',
      arrow: true,
      placement: 'bottom',
      //hideOnClick: true,
      interactive: true,
      multiple: true,
      sticky: true
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
    console.log(issuesGraph);
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
            dataNode.fields.summary,
            dataNode
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

      /*
      cy.on('click', 'node', (event: any) => {
        this.clickIssue(event.target);
      });
  */
      let layout = cy.layout({
        name: 'cose-bilkent',
        animate: false
      });
      layout.run();
    }
  };

  render() {
    const { classes, issuesGraph } = this.props;

    const stylesheet = [
      {
        selector: 'node',
        style: {
          width: 10,
          height: 10
          //                    content: 'data(id)'
          //                    shape: 'vee'
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          width: 2,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd'
        }
      },
      {
        selector: ':parent',
        style: {
          'background-opacity': 0.333
        }
      },
      {
        selector: '[status != "Done"]',
        style: {
          backgroundColor: '#28a745'
        }
      },
      {
        selector: '[status = "Done"]',
        style: {
          backgroundColor: '#cb2431'
        }
      },
      {
        selector: '[?partial]',
        style: {
          shape: 'rectangle'
        }
      },
      {
        selector: '[distance = 0]',
        style: {
          width: 20,
          height: 20
        }
      },
      {
        selector: 'edge.not-path',
        style: {
          opacity: 0.1,
          'z-index': 0
        }
      },
      {
        selector: 'node.not-path',
        style: {
          opacity: 0.333,
          'z-index': 0
        }
      },
      {
        selector: 'edge.path',
        style: {
          opacity: 0.888,
          'z-index': 0,
          width: 4,
          'line-color': '#2196f3',
          'target-arrow-color': '#2196f3'
        }
      }
    ];
    return (
      <React.Fragment>
        {issuesGraph.length > 0 ? (
          <Grid container direction='row' justify='flex-start' spacing={3}>
            <Grid item xs={10}>
              <div style={{ textAlign: 'left', border: '3px' }}>
                <CytoscapeComponent
                  elements={[]}
                  layout={{ name: 'cose-bilkent' }}
                  style={{ height: '500px' }}
                  stylesheet={stylesheet}
                  cy={(cy: any) => (this.chartRef = cy)}
                />
              </div>
            </Grid>
            <Grid item xs={2}>
              <span>Some legend</span>
            </Grid>
          </Grid>
        ) : (
          <span>Please select an initiative from the other tabs first</span>
        )}
      </React.Fragment>
    );
  }
}

export default connect(
  mapState,
  mapDispatch
)(withStyles(styles)(TreeGraph));
