import WidgetKit
import SwiftUI

// Data model for routine state
struct RoutineData: Codable {
    let routine1: Bool
    let routine2: Bool
    let routine3: Bool
    let routine4: Bool
    let routine5: Bool
    let lastUpdated: Date
    
    static let empty = RoutineData(
        routine1: false,
        routine2: false,
        routine3: false,
        routine4: false,
        routine5: false,
        lastUpdated: Date()
    )
}

// Timeline Provider
struct RoutineProvider: TimelineProvider {
    func placeholder(in context: Context) -> RoutineEntry {
        RoutineEntry(date: Date(), data: RoutineData.empty)
    }

    func getSnapshot(in context: Context, completion: @escaping (RoutineEntry) -> ()) {
        let data = loadRoutineData()
        let entry = RoutineEntry(date: Date(), data: data)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let data = loadRoutineData()
        let entry = RoutineEntry(date: Date(), data: data)
        
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadRoutineData() -> RoutineData {
        // Load from shared UserDefaults (App Group)
        guard let userDefaults = UserDefaults(suiteName: "group.com.michalchudziak.NaukaLiluka") else {
            return RoutineData.empty
        }
        
        guard let data = userDefaults.data(forKey: "routineData"),
              let routineData = try? JSONDecoder().decode(RoutineData.self, from: data) else {
            return RoutineData.empty
        }
        
        // Reset if it's a new day
        let calendar = Calendar.current
        if !calendar.isDateInToday(routineData.lastUpdated) {
            return RoutineData.empty
        }
        
        return routineData
    }
}

// Timeline Entry
struct RoutineEntry: TimelineEntry {
    let date: Date
    let data: RoutineData
}

// Widget View
struct RoutineWidgetEntryView : View {
    var entry: RoutineProvider.Entry
    
    let routineLabels = [
        "Bez powtórzeń",
        "Książki 1",
        "Książki 2", 
        "Książki 3",
        "Obrazki"
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Dzisiejsze rutyny")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                Spacer()
            }
            .padding(.bottom, 2)
            
            VStack(alignment: .leading, spacing: 4) {
                CheckboxRow(label: routineLabels[0], isChecked: entry.data.routine1)
                CheckboxRow(label: routineLabels[1], isChecked: entry.data.routine2)
                CheckboxRow(label: routineLabels[2], isChecked: entry.data.routine3)
                CheckboxRow(label: routineLabels[3], isChecked: entry.data.routine4)
                CheckboxRow(label: routineLabels[4], isChecked: entry.data.routine5)
            }
        }
        .padding(12)
        .containerBackground(Color(hex: "#d303fc"), for: .widget)
    }
}

// Checkbox Row Component
struct CheckboxRow: View {
    let label: String
    let isChecked: Bool
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: isChecked ? "checkmark.square.fill" : "square")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(isChecked ? 1.0 : 0.7))
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(isChecked ? 1.0 : 0.7))
                .strikethrough(isChecked, color: .white.opacity(0.7))
            
            Spacer()
        }
    }
}

// Color extension for hex colors
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// Widget Configuration
struct RoutineWidget: Widget {
    let kind: String = "RoutineWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: RoutineProvider()) { entry in
            RoutineWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Rutyny Dnia")
        .description("Śledź swoje dzienne rutyny")
        .supportedFamilies([.systemSmall])
    }
}

// Preview
struct RoutineWidget_Previews: PreviewProvider {
    static var previews: some View {
        RoutineWidgetEntryView(entry: RoutineEntry(
            date: Date(),
            data: RoutineData(
                routine1: true,
                routine2: true,
                routine3: false,
                routine4: false,
                routine5: false,
                lastUpdated: Date()
            )
        ))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}