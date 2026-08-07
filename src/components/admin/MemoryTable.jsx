export default function MemoryTable() {

  const memories = [
    {
      title: "Welcome to the World",
      date: "14 Sept 2024",
      category: "Birth",
    },
    {
      title: "First Smile",
      date: "20 Sept 2024",
      category: "Milestone",
    },
    {
      title: "Name Ceremony",
      date: "October 2024",
      category: "Family",
    },
  ];

  return (

    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

      <table className="w-full">

        <thead className="bg-[#F7F3EA]">

          <tr>

            <th className="text-left p-5">Title</th>

            <th className="text-left p-5">Date</th>

            <th className="text-left p-5">Category</th>

            <th className="text-center p-5">Actions</th>

          </tr>

        </thead>

        <tbody>

          {memories.map((memory) => (

            <tr
              key={memory.title}
              className="border-t"
            >

              <td className="p-5">
                {memory.title}
              </td>

              <td className="p-5">
                {memory.date}
              </td>

              <td className="p-5">
                {memory.category}
              </td>

              <td className="p-5 text-center">

                <button className="mr-3 text-green-600">
                  Edit
                </button>

                <button className="text-red-600">
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}