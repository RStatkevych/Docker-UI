import React, { Component } from 'react'
import {Link} from 'react-router'
import '../style.less'
import Button from './Button'

import ReactDOM from 'react-dom'

export default class ItemsList extends Component {

	constructor() {
		super()
		this.state = {
			selected: [],
			checkAll: false,
			height: 100,
			activeButtons: []
		}
		this.onWindowResize = this.onWindowResize.bind(this)
	}
	onCheckSingleItem(index) {
		return () => {
			let newState = _.assign(this.state.selected, {[index]: !this.state.selected[index]});
			this.setState({
				selected: newState
			})
			let selected = this.props.components.filter((x, index) => !!newState[index])

			_.each(this.props.buttons, (button, i) => {
				const {isActive = (_)=> true} = button;
				let active = this.state.activeButtons
				active[i] = isActive(selected)
				this.setState({activeButtons: active})
			})
		}
	}

	onCheckAll() {
		this.setState({checkAll: !this.state.checkAll})
	}

	onWindowResize() {
		console.log(window.innerHeight, window.innerWidth)
		if(this.table) {
			let rect = this.table.getBoundingClientRect()
			let top = rect.top
			this.setState({height: window.innerHeight - top})
		}
	}
	componentDidMount() {
		window.addEventListener('resize', this.onWindowResize)
		this.onWindowResize();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onWindowResize)
	}
	componentDidUpdate(props, state) {
		if(state.checkAll !== this.state.checkAll) {
			let temp = this.props.components.map((__, index) => this.state.checkAll)
			this.setState({selected: temp})
		}
	}

	_wrapButtonHandler (f) {
		return (() => {
			let selected = this.props.components.filter((x, index) => !!this.state.selected[index])
			return f(selected)
		}).bind(this)
	}

	render() {
		const { components, children, fieldOrder, linkMapping = {}, controlsEnabled = true, checkboxEnabled = true, 
				actionMapping = {}, tableClassName = '', buttons = {}, fetched = true, errorMessage = null } = this.props;
		const { selected, checkAll } = this.state;
		let { collumnWidth } = this.props;
		if(!collumnWidth) {
			collumnWidth = _.map(fieldOrder, () => 100 / (fieldOrder.length + 1) +'%')
		}
		return (
			<div className="collumn">
				<div className={tableClassName}>
				 	{controlsEnabled ?
						<div className="control-buttons">
							{ _.map(buttons, (button, i) => {
								let {onClick, text} = button
								let active = !!this.state.activeButtons[i]
								let handler = this._wrapButtonHandler(onClick)
								return (
									<Button text={text}
											active={active}
											onClick={handler}
									/>)
							}) }
						</div>
						: null
					}
					<div className='item-list'>
						<div className='item-list-head'>
							{checkboxEnabled ?
								<span style={{width : collumnWidth[0]}}>
									<input type="checkbox" 
										onChange={this.onCheckAll.bind(this)}
										checked={checkAll}>
									</input>
								</span>
								: null
							}
							{_.map(fieldOrder, (field, i)=>(<span style={{width : collumnWidth[i]}}>{field}</span>))}
						</div>
						<div className='item-list-body' ref={(ref) => {this.table = ref}} style={{height: this.state.height}}>
							<div>
							{
								fetched === false ? 
								<p>Data is loading</p>:
								null
							}
							{	fetched === true ?
								components.map((item, i) => {
									return (
										<div>
											{checkboxEnabled ?
												<span><input type="checkbox" 
													onChange={this.onCheckSingleItem(i).bind(this)}
													checked={!!selected[i]}></input></span>
												: null
											}
											{_.map(fieldOrder, (field, index)=> {
												return (index in linkMapping) ? 
													(<span 
														style={{width : collumnWidth[index]}}>
															<Link to={linkMapping[index](item)}>{item[field]}</Link>
													</span>)
													: ( index in actionMapping ?
														(<span 
															style={{width : collumnWidth[index]}}
															onClick={() => {
															actionMapping[index](item)
															}}>{item[field]}</span>) 
														: (<span
															style={{width : collumnWidth[index]}}
															>{item[field]}</span>)
													)
											})}
										</div>
									)
								})
								: null
							} 
							{
								fetched === true && errorMessage ?
									<p>{errorMessage}</p>
								: null
							}
							</div>
						</div>

					</div>
				</div>
				{children}
			</div>
		)
	}
}