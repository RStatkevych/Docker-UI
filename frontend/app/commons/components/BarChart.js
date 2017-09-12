import React, { Component } from 'react'
import './style.less'

const BAR_HEIGHT = 30
const VIEW_BOX_LENGTH = 1200

export default class BarChart extends Component {
	render() {
		const { data, maxValue } = this.props;
		let height = data.length * BAR_HEIGHT;
		let viewBox = [VIEW_BOX_LENGTH, height]
		return (
			<svg
				className='bar-chart'
				preserveAspectRatio="xMidYMid"
				style={{width:"100%",height}}
				viewBox={viewBox}>
				{_.map(data, (value, index) => {
						let relation = value/maxValue;
						return (
							<rect x="0" 
								  y={index * BAR_HEIGHT+BAR_HEIGHT/3}
								  height={BAR_HEIGHT/3}
								  width={VIEW_BOX_LENGTH * relation}></rect>
						)
					})
				}
			</svg>
		)
	}
}