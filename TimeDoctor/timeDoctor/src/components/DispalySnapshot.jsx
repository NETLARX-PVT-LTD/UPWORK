import axios from "axios";
import React, { useEffect, useState } from "react";

const DispalySnapshot = () => {
//   const data = [
//     {
//       id: 1,
//       name: "Nikhil",
//       data: [
//         ["imag1", "img2", "img3"],
//         ["imag4", "img5", "img6"],
//       ],
//     },
//     {
//       id: 2,
//       name: "Abhinav",
//       data: [
//         ["imag1", "img2", "img3"],
//         ["imag4", "img5", "img6"],
//       ],
//     },
//     {
//       id: 3,
//       name: "Pranjul",
//       data: [
//         ["imag1", "img2", "img3"],
//         ["imag4", "img5", "img6"],
//       ],
//     },
//     {
//       id: 4,
//       name: "Rudra",
//       data: [
//         ["imag1", "img2", "img3"],
//         ["imag4", "img5", "img6"],
//       ],
//     },
//     {
//       id: 5,
//       name: "Shubham",
//       data: [
//         ["imag1", "img2", "img3"],
//         ["imag4", "img5", "img6"],
//       ],
//     },
//   ];

const user = ["Nikhil", "Pranjul"]

  const [dropDown, setDropDown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSnapShotData, setUserSnapShotData] = useState([]);
  const fetchSnapShot = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/snapshot", selectedUser);
    const data = response.data;

    if (data.length > 0) {
        // setSelectedUser()
      setUserSnapShotData((prev) => [...prev, ...data[1].imageData]);
      console.log("Fetched images1:", data[1].imageData);
      console.log("Fetched images:", data[1]);

    } else {
      console.log("No snapshot data found");
    }
  } catch (error) {
    console.error("Error fetching snapshot:", error);
  }
};
// console.log("Fetched images2:", userSnapShotData);

    // setTimeout(() => {
    //   fetchSnapShot()
    // }, 3000);

    useEffect(() => {
        fetchSnapShot()
    }, [])

//   const filterData = data.filter((option) => option.id == selectedUser);
//   console.log(filterData[0].data[0]);
  return (
    <div>
      <div className="flex flex-col justify-start items-start w-2/3">
        <button
          onClick={() => setDropDown(!dropDown)}
          className="p-2 bg-slate-500 text-white m-10 rounded-sm shadow-md relative"
        >
          ALL USERS
        </button>
        <div className="absolute top-20 left-10 h-24 p-2 rounded-md">
          {dropDown &&
            user.map((item, index) => (
              <ul key={index}>
                <li
                  className="cursor-pointer"
                  onClick={() => setSelectedUser(item)}
                >
                  {dropDown && <h1>{item}</h1>}
                </li>
              </ul>
            ))}
        </div>
      </div>
      <div className="flex gap-4">
        {userSnapShotData &&
          userSnapShotData.map((item, index) => (
            <div key={index}>
              <h1>{item}</h1>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DispalySnapshot;
