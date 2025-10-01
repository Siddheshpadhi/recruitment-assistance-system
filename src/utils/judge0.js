import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/about',
  headers: {
    'x-rapidapi-key': 'a79a739798msh523a0a597db8620p1deea4jsnf464939d3970',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}