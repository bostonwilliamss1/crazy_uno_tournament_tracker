import {
  Document,
  Page,
  Text,
  View,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Tournament } from "@/models/Tournament";

const MyPDFDocument: React.FC<{ tournament: Tournament }> = ({
  tournament,
}) => {
  const players = Object.values(tournament.people);

  const allRounds = [
    ...new Set(
      players.flatMap((player) => Object.keys(player.rounds || {}).map(Number))
    ),
  ].sort((a, b) => a - b);

  return (
    <Document>
      <Page size="A4" style={{ padding: 20 }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            Tournament: {tournament.title}
          </Text>
          <Text>Year: {tournament.year}</Text>
          <View style={{ marginTop: 20, border: "1px solid black" }}>
            <View
              style={{
                flexDirection: "row",
                borderBottom: "1px solid black",
                padding: 5,
              }}
            >
              <Text style={{ width: 50, fontWeight: "bold" }}>Round</Text>
              {players.map((player) => (
                <Text
                  key={player.id}
                  style={{ width: 80, textAlign: "center", fontWeight: "bold" }}
                >
                  {player.name}
                </Text>
              ))}
            </View>
            {allRounds.map((round) => (
              <View
                key={round}
                style={{
                  flexDirection: "row",
                  padding: 5,
                  borderBottom: "1px solid black",
                }}
              >
                <Text
                  style={{ width: 50, fontWeight: "bold", textAlign: "center" }}
                >
                  {round}
                </Text>
                {players.map((player) => (
                  <Text
                    key={player.id}
                    style={{ width: 80, textAlign: "center" }}
                  >
                    {player.rounds?.[round] ?? "-"}
                  </Text>
                ))}
              </View>
            ))}
            <View
              style={{
                flexDirection: "row",
                padding: 5,
                backgroundColor: "#ddd",
              }}
            >
              <Text
                style={{ width: 50, fontWeight: "bold", textAlign: "center" }}
              >
                Total
              </Text>
              {players.map((player) => {
                const totalScore = Object.values(player.rounds || {}).reduce(
                  (sum, score) => sum + score,
                  0
                );
                return (
                  <Text
                    key={player.id}
                    style={{
                      width: 80,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {totalScore}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const MyDocument: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  return (
    <div className="flex flex-col items-center">
      <PDFDownloadLink
        document={<MyPDFDocument tournament={tournament} />}
        fileName={`${tournament.title.replace(/\s+/g, "_")}.pdf`}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mt-4"
      >
        {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
      </PDFDownloadLink>
    </div>
  );
};

export default MyDocument;
