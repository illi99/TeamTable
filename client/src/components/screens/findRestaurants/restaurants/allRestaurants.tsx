import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import "./restaurant.css";
import Restaurant from "./restaurant/Restauant";
import {Filters} from "src/types/Group";
import useUserLikedRestaurants from "src/hooks/useUserLikedRestaurants";
import {useAuth} from "src/auth/AuthProvider";
import {Restaurant as TypedRestaurant} from "src/types/Resturants";
import { isPointInPolygon } from "src/helpers/filter-point-in-ploygon";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface AllRestaurantsProps {
  filters: Filters;
  restaurants: TypedRestaurant[];
}

export const AllRestaurants: React.FC<AllRestaurantsProps> = (props): JSX.Element => {
  const { filters, restaurants } = props;

  const { loggedInUser } = useAuth();
  const userLikedRestaurantsQuery = useUserLikedRestaurants( loggedInUser ? loggedInUser.email: null);

  const [filteredRestaurants, setFilteredRestaurants] = useState([]);



  useEffect(() => {
    const filterByPrice = (restaurant: TypedRestaurant) =>
    !filters.priceRange || filters.priceRange.length === 0 || filters.priceRange.indexOf(restaurant.pricePoint) > -1;

    const filterByDay = (restaurant) =>
      !filters.day || restaurant.openingTimes[filters.day] != null;

    const filterByHour = (restaurant) => {
      const { day, hour } = filters;
      const wasNotChosen = !day || !hour;
      if (wasNotChosen) return true;

      if (!restaurant.openingTimes[day]) return false;

      const openingHour = restaurant.openingTimes[day][0];
      const closingHour = restaurant.openingTimes[day][1];

      return (
        dayjs(`01-01-2000 ${hour}`).isSameOrAfter(
          `01-01-2000 ${openingHour}`
        ) &&
        dayjs(`01-01-2000 ${hour}`).isSameOrBefore(`01-01-2000 ${closingHour}`)
      );
    };

    const filterBySelectedArea = (restaurant) => {
      if (!filters?.selectedArea) return true;
      if (!restaurant.location) return false;
      return isPointInPolygon(restaurant.location, filters.selectedArea);
    }

    setFilteredRestaurants(
      restaurants
        ? restaurants
            .filter(filterBySelectedArea)
            .filter(filterByDay)
            .filter(filterByHour)
            .filter(filterByPrice)
        : []
    );
  }, [restaurants, filters]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
      }}
    >
      {filteredRestaurants?.map((restaurant, i) => (
        <div key={i} style={{ margin: "auto", padding: "0 16px 50px 16px" }}>
          <Restaurant restaurant={restaurant} chosedTags={filters.tags} likedRestaurants={loggedInUser && loggedInUser.email ? userLikedRestaurantsQuery.data: []}/>
        </div>
      ))}
    </div>
  );
};
