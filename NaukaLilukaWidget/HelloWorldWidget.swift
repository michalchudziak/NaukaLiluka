import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), message: "Hello World")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), message: "Hello World")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, message: "Hello World")
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let message: String
}

struct HelloWorldWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("👋")
                .font(.largeTitle)
            
            Text(entry.message)
                .font(.headline)
                .foregroundColor(.primary)
            
            Text(entry.date, style: .time)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .containerBackground(for: .widget) {
            Color(UIColor.systemBackground)
        }
    }
}

struct HelloWorldWidget: Widget {
    let kind: String = "HelloWorldWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HelloWorldWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Hello World")
        .description("A simple Hello World widget")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct HelloWorldWidget_Previews: PreviewProvider {
    static var previews: some View {
        HelloWorldWidgetEntryView(entry: SimpleEntry(date: Date(), message: "Hello World"))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}