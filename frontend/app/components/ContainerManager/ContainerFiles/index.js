import React, { Component } from 'react'

import Provider from '../../../commons/provider'
import FilesList from './FilesList'
import FileContents from './FileContents'
import './style.less'


export default class ContainerFiles extends Component {
	constructor() {
		super()
		this.state = {
			fspath: null,
			files: [],
			fileContent: ''
		}
	}

	fetchFileSystem() {
		let promise = this.provider.builder();
		if(this.state.fspath) {
			promise.query('path', this.state.fspath)
		}
		promise
			.auth()
			.read()
			.then((data) => {
				const { Response: {files, pwd} } = data;
				_.each(files, (file) => {
					if(file.file_name == '.') {
						file.headsTo = pwd
					} else if(file.file_name == '..') {
						let parts = pwd.split('/')
						parts = parts.splice(0, parts.length - 1);
						file.headsTo = parts.join('/')
					} else {
						let parts = pwd.split('/')
						parts.push(file.file_name)
						file.headsTo = parts.join('/')
					}
				})
				this.setState({fspath: pwd, files: files}) 
			})
	}

	getFileContent(path) {
		this.fileReader.builder()
			.auth()
			.query('path', path)
			.stream(true)
			.read()
			.then((data) => {
				this.setState({fileContent: data})
				console.log(data);
			})
	}

	componentDidUpdate(props, state) {
		if(this.state.fspath !== state.fspath) {
			this.fetchFileSystem()
		}
	}

	onFolderClick(item) {
		if(item.file_type === 'directory') {
			this.setState({fspath: item.headsTo})
		} else {
			this.getFileContent(this.state.fspath + '/' + item.file_name)
		}
	}

	componentDidMount() {
		const { routeParams: {container_id}} = this.props

		this.provider = new Provider(`/containers/${container_id}/fs`);
		this.fileReader = new Provider(`/containers/${container_id}/fs/read`);

		this.fetchFileSystem()
	}

	render() {
		const { routeParams: {container_id}} = this.props;
		const { path, files, fileContent } = this.state;
		return (
			<div className="collumn">
				<FilesList
					files={files}
					onFolderClick={this.onFolderClick.bind(this)}
				/>
				<FileContents content={fileContent} />
			</div>
		)
	}
}

