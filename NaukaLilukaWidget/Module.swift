import ExpoModulesCore
import WidgetKit
import SwiftUI

public class ReactNativeWidgetExtensionModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ReactNativeWidgetExtension")
        
        Function("reloadWidget") { () in
            WidgetCenter.shared.reloadAllTimelines()
        }
        
        Function("reloadWidgetWithKind") { (kind: String) in
            WidgetCenter.shared.reloadTimelines(ofKind: kind)
        }
        
        Function("updateRoutineState") { (routine1: Bool, routine2: Bool, routine3: Bool, routine4: Bool, routine5: Bool) in
            let data = RoutineData(
                routine1: routine1,
                routine2: routine2,
                routine3: routine3,
                routine4: routine4,
                routine5: routine5,
                lastUpdated: Date()
            )
            
            // Save to shared UserDefaults
            guard let userDefaults = UserDefaults(suiteName: "group.com.michalchudziak.NaukaLiluka") else {
                print("Failed to access app group")
                return
            }
            
            if let encoded = try? JSONEncoder().encode(data) {
                userDefaults.set(encoded, forKey: "routineData")
                userDefaults.synchronize()
                
                // Reload widget to show new data
                WidgetCenter.shared.reloadTimelines(ofKind: "RoutineWidget")
            }
        }
        
        Function("getRoutineState") { () -> [String: Any] in
            guard let userDefaults = UserDefaults(suiteName: "group.com.michalchudziak.NaukaLiluka"),
                  let data = userDefaults.data(forKey: "routineData"),
                  let routineData = try? JSONDecoder().decode(RoutineData.self, from: data) else {
                return [
                    "routine1": false,
                    "routine2": false,
                    "routine3": false,
                    "routine4": false,
                    "routine5": false
                ]
            }
            
            // Reset if it's a new day
            let calendar = Calendar.current
            if !calendar.isDateInToday(routineData.lastUpdated) {
                return [
                    "routine1": false,
                    "routine2": false,
                    "routine3": false,
                    "routine4": false,
                    "routine5": false
                ]
            }
            
            return [
                "routine1": routineData.routine1,
                "routine2": routineData.routine2,
                "routine3": routineData.routine3,
                "routine4": routineData.routine4,
                "routine5": routineData.routine5
            ]
        }
    }
}

// Shared data model (same as in widget)
struct RoutineData: Codable {
    let routine1: Bool
    let routine2: Bool
    let routine3: Bool
    let routine4: Bool
    let routine5: Bool
    let lastUpdated: Date
}