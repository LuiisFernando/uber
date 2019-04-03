import React, { Component, Fragment } from 'react'
import { StyleSheet, View, Alert, Image } from 'react-native'
import Geocoder from 'react-native-geocoding'

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

import Search from '../Search'
import Directions from '../Directions'
import Details from '../Details'

import { getPixelSize } from './../utils'

import markerImage from '../../../assets/marker.png'
import backImage from '../../../assets/back.png'

import {
    Back,
    LocationBox,
    LocationText,
    LocationTimeBox,
    LocationTimeBoxText,
    LocationTimeTextSmall
} from "./styles";

Geocoder.init("API_KEY");

export default class Map extends Component {

    state = {
        region: null,
        destination: null,
        duration: null,
        location: null
    }

    async componentDidMount() {
        this.mapView = null
        
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                const response = await Geocoder.from({ latitude, longitude })
                const address = response.results[0].formatted_address
                const location = address.substring(0, address.indexOf(','))

                this.setState({
                    location,
                    region: {
                        latitude, 
                        longitude, 
                        latitudeDelta: 0.006,
                        longitudeDelta: 0.006 
                    }
                }, console.log('ae', 'SUCESSO GET POSICAO')) //success
            },
            (error) => {
                console.log(error)
                Alert.alert('Erro', 'Erro: ' + error.message)
            }, //error
            {
                timeout: 5000,
                enableHighAccuracy: false,
                maximumAge: 1000
            }
        )
    }

    handleLocationSelected = (data, { geometry }) => {
        // destruction geometry creating object location with 2 attributes lat and long
        const { location: { lat: latitude, lng: longitude } } = geometry;
        
        this.setState({
            destination: {
                latitude,
                longitude,
                title: data.structured_formatting.main_text // short possible name of destination user
            }
        })
    }

    handleBack = () => {
        this.setState({ destination: null })
    }


    
    render() {
        const { region, destination, duration, location } = this.state

        if (destination)
            console.log("DESTINATION > ", destination)

        return (
          <View style={styles.container}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              showsUserLocation={true}
              loadingEnabled={true}
              initialRegion={region}
              ref={ref => {
                this.mapView = ref;
              }}
            >
              {destination && (
                <Fragment>
                  <Directions
                    origin={region}
                    destination={destination}
                    onReady={result => {
                      this.setState({
                        duration: Math.floor(result.duration)
                      });

                      this.mapView.fitToCoordinates(
                        result.coordinates,
                        {
                          edgePadding: {
                            right: getPixelSize(50),
                            left: getPixelSize(50),
                            top: getPixelSize(50),
                            bottom: getPixelSize(350)
                          }
                        }
                      );
                    }}
                  />
                  <Marker
                    coordinate={destination}
                    anchor={{ x: 0, y: 0 }}
                    image={markerImage}
                  >
                    <LocationBox>
                      <LocationText>{destination.title}</LocationText>
                    </LocationBox>
                  </Marker>

                  <Marker coordinate={region} anchor={{ x: 0, y: 0 }}>
                    <LocationBox>
                      <LocationTimeBox>
                        <LocationTimeBoxText>
                          {duration}
                        </LocationTimeBoxText>
                        <LocationTimeTextSmall>
                          Min
                        </LocationTimeTextSmall>
                      </LocationTimeBox>
                      <LocationText>{location}</LocationText>
                    </LocationBox>
                  </Marker>
                </Fragment>
              )}
            </MapView>

            {destination ? (
              <Fragment>
                  <Back onPress={this.handleBack}>
                    <Image source={backImage} />
                  </Back>
                <Details />
              </Fragment>
            ) : (
              <Search
                onLocationSelected={this.handleLocationSelected}
              />
            )}
          </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        flex: 1
    }
});