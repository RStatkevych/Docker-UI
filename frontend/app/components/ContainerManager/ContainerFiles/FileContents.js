import React, { Component } from 'react'
import ItemsList from '../../../commons/components/ItemsList'
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/theme/github';

export default class FileContents extends Component {


	render() {
		const { content } = this.props;
		return (
			<div className='collumn file-ace-editor'>
				  <AceEditor
				    theme="github"
				    height="100%"
				    width="100%"
				    value={content}
				    name="UNIQUE_ID_OF_DIV"
				    editorProps={{$blockScrolling: true}}
				  />,
			</div>
		)
	}
}

