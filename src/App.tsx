import { Fragment, useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';

import { Body } from './components/Body';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Forecast } from './components/Forecast';

import { getCurrentWeather } from './services/getCurrentWeather';

import './components/Input.css';

export enum Unit {
  Standard = 'standard',
  Metric = 'metric',
  Imperial = 'imperial',
}

export type Coord = {
  lon: number;
  lat: number;
};

export type Weather = {
  id: number;
  main: string;
  description: string;
};

export type ForecastType = {
  name: string;
  coord: Coord;
  weather: Weather[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
};

const weatherStorageKey = 'lastWeather';

export const App: React.FC = () => {
  const [unit] = useState(Unit.Metric);
  const [currentForecast, setCurrentForecast] = useState<ForecastType | null>(null);

  useEffect(() => {
    const lastSuccesfullWeather = localStorage.getItem(weatherStorageKey);
    if (!lastSuccesfullWeather) {
      return;
    }

    try {
      const deserialisedWeather = JSON.parse(lastSuccesfullWeather);
      setCurrentForecast(deserialisedWeather);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <Fragment>
      <Header>
        <Formik
          initialValues={{ search: '' }}
          onSubmit={async (values, { resetForm }) => {
            try {
              const result = await getCurrentWeather(values.search, unit);
              if (result.cod !== 200) {
                throw new Error(`Error while fetching weather. ${result.message}`);
              }
              setCurrentForecast(result);
              resetForm();
              const serializedWeather = JSON.stringify(result);
              localStorage.setItem(weatherStorageKey, serializedWeather);
            } catch (error) {
              // TODO: error handling
              console.error(error);
            }
          }}
        >
          <Form>
            <div className='search-input'>
              <Field name='search' placeholder='Location...' />
              <span className='icon' />
            </div>
          </Form>
        </Formik>
      </Header>
      <Body>{currentForecast && <Forecast forecast={currentForecast} units={unit} />}</Body>
      <Footer />
    </Fragment>
  );
};
