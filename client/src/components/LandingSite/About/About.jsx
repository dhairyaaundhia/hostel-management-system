import { TeamCard } from "./TeamMember";
// import dhairyaPhoto from "C:/Users/dhair/Desktop/project/client/src/assets/photo-dd.jpg";
function About() {
  const dhairya = {
    name: "Dhairya Aundhia",
    // designation: "Front-end Engineer",
    image: dhairyaPhoto,
  };
  const kunj = {
    name: "Kunj Nirmal",
    // designation: "Backend-end Engineer",
    image:
      "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  };
  const rishi = {
    name: "Rishi Patel",
    // designation: "Front End Developer",
    image:
      "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  };
  // const muneeb = {
  //   name: "Muneeb Ahmed",
  //   designation: "Front End Developer",
  //   image:
  //     "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  // };
  // const arsal = {
  //   name: "Syed Arsal",
  //   designation: "Database",
  //   image:
  //     "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  // };

  return (
    <>
      <h1 className="font-bold text-white text-center text-5xl">
        Meet Our Team!
      </h1>
      <div className="py-20 sm:py-25 flex gap-10 flex-wrap justify-center align-center">
        <TeamCard member={dhairya} />
        <TeamCard member={rishi} />
        <TeamCard member={kunj} />
        {/*  */}
      </div>
    </>
  );
}
export { About };
