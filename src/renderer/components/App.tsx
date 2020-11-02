import React, { useEffect, useState } from 'react';

export default function App() {

	const [msg, setMsg] = useState('-');

	useEffect(() => {
		fetch('http://127.0.0.1:2003/api/hello')
			.then((response) => {
				return response.json();
			})
			.then(({ status, msg }) => {
				status === 0 && setMsg(msg);
			});
	}, [])

	return(
		<div>
			<h1>{msg}</h1> 
			<h2>
				Now using Nest.js with Electron.
			</h2>
			<h3>
				Using React, Typescript & Hot reload.
			</h3>
		</div>
	);
}
