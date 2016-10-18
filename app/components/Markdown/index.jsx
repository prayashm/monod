import React, { Component, PropTypes } from 'react';
import CodeMirror from 'codemirror';

import 'codemirror/mode/gfm/gfm';
import 'codemirror/lib/codemirror.css';

import config from '../../config';
import extraKeys from './extra-keys';


export default class Markdown extends Component {

  constructor(props, context) {
    super(props, context);

    this.setTextareaEl = this.setTextareaEl.bind(this);
  }

  componentDidMount() {
    const textareaNode = this.$textarea;
    const options = {
      autofocus: true,
      lineNumbers: true,
      lineWrapping: true,
      scrollbarStyle: null,
      mode: config.CODE_MIRROR_MODE,
      theme: config.CODE_MIRROR_THEME,
      extraKeys,
    };

    // CodeMirror main instance
    this.codeMirror = CodeMirror.fromTextArea(textareaNode, options);

    // Bind CodeMirror events
    this.codeMirror.on('change', this.onChange.bind(this));
    this.codeMirror.on('scroll', this.onScroll.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (true === nextProps.forceUpdate && this.props.content !== nextProps.content) {
      this.getCodeMirror().setValue(nextProps.content);
    }

    if (true === nextProps.refresh) {
      const s = this.getCodeMirror().getSelection();

      this.getCodeMirror().refresh();
      this.getCodeMirror().setSelection(s);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  onChange(doc, change) {
    if ('setValue' !== change.origin) {
      const newValue = doc.getValue();

      if (newValue !== this.props.content) {
        // Update the value -> rendering
        this.props.onChange(newValue);
      }
    }

    // Update scrolling position (ensure rendering is visible)
    this.onScroll();
  }

  onScroll() {
    const { top, height, clientHeight } = this.getCodeMirror().getScrollInfo();

    this.props.onUpdatePosition(top / (height - clientHeight));
  }

  setTextareaEl(node) {
    this.$textarea = node;
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  render() {
    return (
      <div className="markdown">
        <textarea
          ref={this.setTextareaEl}
          placeholder="Type your *markdown* content here"
          onChange={this.props.onChange}
          value={this.props.content}
          autoComplete="off"
        />
      </div>
    );
  }
}

Markdown.propTypes = {
  content: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onUpdatePosition: PropTypes.func.isRequired,
  // eslint rule disabled becasue false positive
  forceUpdate: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
  refresh: PropTypes.bool.isRequired, // eslint-disable-line react/no-unused-prop-types
};

Markdown.defaultProps = {
  refresh: false,
};
