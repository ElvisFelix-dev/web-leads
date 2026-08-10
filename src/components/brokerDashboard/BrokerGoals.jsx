export default function BrokerGoals({ goals }) {

  return (

    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">

      <h2 className="text-xl font-semibold mb-6">

        Metas

      </h2>

      {

        goals.map(goal => (

          <div key={goal.title} className="mb-6">

            <div className="flex justify-between mb-2">

              <span>{goal.title}</span>

              <span>

                {goal.current}/{goal.target}

              </span>

            </div>

            <div className="h-3 rounded-full bg-gray-800">

              <div

                style={{

                  width: `${goal.percent}%`

                }}

                className="h-3 rounded-full bg-blue-500"

              />

            </div>

          </div>

        ))

      }

    </div>

  )

}
