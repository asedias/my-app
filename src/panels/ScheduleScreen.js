import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, PanelHeader, PanelHeaderContent, Spinner, Group, List, Footer } from '@vkontakte/vkui';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import PeriodView from '../components/PeriodView';
import connect from '@vkontakte/vk-connect';

import './ScheduleScreen.css';

class ScheduleScreen extends Component {
	
	list = [];
	header = "";
	
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			groupName: '',
			day: null,
			count: 0,
		}
		this.setupConnect();
	}
	
	setupConnect = () => {
		connect.subscribe(({ detail: { type, data }}) => {
				console.log(data);
				if (type === 'VKWebAppUpdateConfig') {
					const schemeAttribute = document.createAttribute('scheme');
					schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
					document.body.attributes.setNamedItem(schemeAttribute);
				}
				if (type === 'VKWebAppAccessTokenReceived') {
					this.fetchData(data.access_token);
				} 
				if (type === 'VKWebAppAccessTokenFailed' | 'VKWebAppCallAPIMethodFailed') {
					
				}
				if (type === 'VKWebAppCallAPIMethodResult') {
					if(data.response === '') {
						this.props.go('choose');
					} else if(data.request_id === "getGroup") {
						this.updateData(data.response);
					}
				}
			});
			connect.send("VKWebAppGetAuthToken", {"app_id": 7241048, "scope": ''});
	}
	
	fetchData = (access_token) => {
		connect.send("VKWebAppCallAPIMethod",  {
				"method": "execute.getUserGroup", 
				"params": {"v":"5.103", "access_token": access_token, "request_id": "getGroup"}
			}
		);
	}
	
	getDay = (week, day) => {
		switch(day) {
			case 1: return week.mon;
			case 2: return week.tue;
			case 3: return week.wed;
			case 4: return week.thu;
			case 5: return week.fri;
			default: return week.tue;
		}
	}
	
	getCountPlural = (count) => {
		switch(count) {
			case 1: return count + ' пара';
			case 5: return count + ' пар';
			default: return count + ' пары';
		}
	}
	
	updateData = (groupName) => {
		var schedule = require('../json/'+groupName+'.json');
		this.header = 	<PanelHeaderContent
							aside={<Icon16Dropdown />}
							onClick={() => {}} >
								Нечётная неделя
						</PanelHeaderContent>;
		var dayOfWeek = new Date().getDay(); dayOfWeek = dayOfWeek > 5 ? 1 : dayOfWeek;
		var day = this.getDay(schedule.week1, dayOfWeek);
		var count = 0;
		day.forEach(item => { if(item.cab) count++ });
		this.setState({loading: false, groupName: groupName, day: day, count: count});
		
	}
	
	render() {
		return (
			<Panel id="schedule">
				<PanelHeader>
					{this.state.loading ? <Spinner /> : this.header }
				</PanelHeader>
				<Group>
					<List>{ this.state.loading ? <div/> :
								this.state.day.map(function (item,index) {
									return (
										<PeriodView name={item.name} type={item.type} time={index+1} tch={item.tch} cab={item.cab} key={index}/>
									);
								}, this)
							
						}
					</List>
				</Group>
				{this.state.loading ? 	<div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
											<Spinner size="small" style={{ marginTop: 20 }} />
										</div> : <Footer>{this.getCountPlural(this.state.count)}</Footer> }
			</Panel>
		)
	}
};

ScheduleScreen.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
};

export default ScheduleScreen;
